/*
 * MIT License
 *
 * Copyright (c) 2020-present Cloudogu GmbH and Contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import React, { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import styled from "styled-components";
// @ts-ignore
import { Decoration, getChangeKey, Hunk } from "react-diff-view";
import { ButtonGroup } from "../buttons";
import Tag from "../Tag";
import Icon from "../Icon";
import { Change, FileDiff, Hunk as HunkType } from "@scm-manager/ui-types";
import { ChangeEvent, DiffObjectProps } from "./DiffTypes";
import TokenizedDiffView from "./TokenizedDiffView";
import DiffButton from "./DiffButton";
import { DefaultCollapsed, MenuContext, OpenInFullscreenButton } from "@scm-manager/ui-components";
import HunkExpandLink from "./HunkExpandLink";
import { Modal } from "../modals";
import ErrorNotification from "../ErrorNotification";
import HunkExpandDivider from "./HunkExpandDivider";
import { escapeWhitespace } from "./diffs";
import { ExpandableHunk, getHunk, useHunks } from "@scm-manager/ui-api";

const EMPTY_ANNOTATION_FACTORY = {};

type Props = DiffObjectProps & {
  file: FileDiff;
};

type Collapsible = {
  collapsed?: boolean;
};

const DiffFilePanel = styled.div`
  /* remove bottom border for collapsed panels */
  ${(props: Collapsible) => (props.collapsed ? "border-bottom: none;" : "")};
`;

const FullWidthTitleHeader = styled.div`
  max-width: 100%;
`;

const TitleWrapper = styled.span`
  margin-left: 0.25rem;
`;

const AlignRight = styled.div`
  margin-left: auto;
`;

const HunkDivider = styled.hr`
  margin: 0.5rem 0;
`;

const ChangeTypeTag = styled(Tag)`
  margin-left: 0.75rem;
`;

const MarginlessModalContent = styled.div`
  margin: -1.25rem;

  & .panel-block {
    flex-direction: column;
    align-items: stretch;
  }
`;

const getDefaultCollapse = (file: FileDiff, defaultCollapse: DefaultCollapsed) => {
  if (typeof defaultCollapse === "boolean") {
    return defaultCollapse;
  } else if (typeof defaultCollapse === "function") {
    return defaultCollapse(file.oldPath, file.newPath);
  } else {
    return false;
  }
};

const DiffFile: FC<Props> = ({
  file,
  markConflicts = true,
  fileControlFactory,
  fileAnnotationFactory,
  annotationFactory,
  defaultCollapse = false,
  sideBySide: initialSideBySide = false,
  hunkClass,
  onClick,
}) => {
  const [t] = useTranslation("repos");
  const [collapsed, setCollapsed] = useState<boolean>();
  const [sideBySide, setSideBySide] = useState<boolean>(initialSideBySide);
  const [expansionError, setExpansionError] = useState<Error | null>(null);
  const { error, hunks, expandTop, expandBottom } = useHunks(file);

  useEffect(() => {
    setCollapsed(getDefaultCollapse(file, defaultCollapse));
  }, [defaultCollapse]);

  useEffect(() => {
    setExpansionError(error);
  }, [error]);

  const viewType = sideBySide ? "split" : "unified";

  const hasContent = file && !file.isBinary && hunks.length > 0;

  const toggleCollapse = () => {
    if (hasContent) {
      setCollapsed(!collapsed);
    }
  };

  const toggleSideBySide = (callback: () => void) => {
    setSideBySide(!sideBySide);
    callback();
  };

  const expandHunkHead = (expandableHunk: ExpandableHunk, count: number) => {
    return () => {
      return expandableHunk.expandHead(count);
    };
  };

  const expandHunkBottom = (expandableHunk: ExpandableHunk, count: number) => {
    return () => {
      return expandableHunk.expandBottom(count);
    };
  };

  const createHunkHeader = (expandableHunk: ExpandableHunk) => {
    if (expandableHunk.maxExpandHeadRange > 0) {
      if (expandableHunk.maxExpandHeadRange <= 10) {
        return (
          <HunkExpandDivider>
            <HunkExpandLink
              icon={"fa-angle-double-up"}
              onClick={expandHunkHead(expandableHunk, expandableHunk.maxExpandHeadRange)}
              text={t("diff.expandComplete", { count: expandableHunk.maxExpandHeadRange })}
            />
          </HunkExpandDivider>
        );
      } else {
        return (
          <HunkExpandDivider>
            <HunkExpandLink
              icon={"fa-angle-up"}
              onClick={expandHunkHead(expandableHunk, 10)}
              text={t("diff.expandByLines", { count: 10 })}
            />{" "}
            <HunkExpandLink
              icon={"fa-angle-double-up"}
              onClick={expandHunkHead(expandableHunk, expandableHunk.maxExpandHeadRange)}
              text={t("diff.expandComplete", { count: expandableHunk.maxExpandHeadRange })}
            />
          </HunkExpandDivider>
        );
      }
    }
    // hunk header must be defined
    return <span />;
  };

  const createHunkFooter = (expandableHunk: ExpandableHunk) => {
    if (expandableHunk.maxExpandBottomRange > 0) {
      if (expandableHunk.maxExpandBottomRange <= 10) {
        return (
          <HunkExpandDivider>
            <HunkExpandLink
              icon={"fa-angle-double-down"}
              onClick={expandHunkBottom(expandableHunk, expandableHunk.maxExpandBottomRange)}
              text={t("diff.expandComplete", { count: expandableHunk.maxExpandBottomRange })}
            />
          </HunkExpandDivider>
        );
      } else {
        return (
          <HunkExpandDivider>
            <HunkExpandLink
              icon={"fa-angle-down"}
              onClick={expandHunkBottom(expandableHunk, 10)}
              text={t("diff.expandByLines", { count: 10 })}
            />{" "}
            <HunkExpandLink
              icon={"fa-angle-double-down"}
              onClick={expandHunkBottom(expandableHunk, expandableHunk.maxExpandBottomRange)}
              text={t("diff.expandComplete", { count: expandableHunk.maxExpandBottomRange })}
            />
          </HunkExpandDivider>
        );
      }
    }
    // hunk footer must be defined
    return <span />;
  };

  const createLastHunkFooter = (expandableHunk: ExpandableHunk) => {
    if (expandableHunk.maxExpandBottomRange !== 0) {
      return (
        <HunkExpandDivider>
          <HunkExpandLink
            icon={"fa-angle-down"}
            onClick={expandHunkBottom(expandableHunk, 10)}
            text={t("diff.expandLastBottomByLines", { count: 10 })}
          />{" "}
          <HunkExpandLink
            icon={"fa-angle-double-down"}
            onClick={expandHunkBottom(expandableHunk, expandableHunk.maxExpandBottomRange)}
            text={t("diff.expandLastBottomComplete")}
          />
        </HunkExpandDivider>
      );
    }
    // hunk header must be defined
    return <span />;
  };

  const collectHunkAnnotations = (hunk: HunkType) => {
    if (annotationFactory) {
      return annotationFactory({
        hunk,
        file,
      });
    } else {
      return EMPTY_ANNOTATION_FACTORY;
    }
  };

  const handleClickEvent = (change: Change, hunk: HunkType) => {
    const context = {
      changeId: getChangeKey(change),
      change,
      hunk,
      file,
    };
    if (onClick) {
      onClick(context);
    }
  };

  const createGutterEvents = (hunk: HunkType) => {
    if (onClick) {
      return {
        onClick: (event: ChangeEvent) => {
          handleClickEvent(event.change, hunk);
        },
      };
    }
  };

  const renderHunk = (file: FileDiff, expandableHunk: ExpandableHunk, i: number) => {
    const hunk = expandableHunk.hunk;
    if (markConflicts && hunk.changes) {
      markHunkConflicts(hunk);
    }
    const items = [];
    if (file._links?.lines) {
      items.push(createHunkHeader(expandableHunk));
    } else if (i > 0) {
      items.push(
        <Decoration>
          <HunkDivider />
        </Decoration>
      );
    }

    items.push(
      <Hunk
        key={"hunk-" + hunk.content}
        hunk={expandableHunk.hunk}
        widgets={collectHunkAnnotations(hunk)}
        gutterEvents={createGutterEvents(hunk)}
        className={hunkClass ? hunkClass(hunk) : null}
      />
    );
    if (file._links?.lines) {
      if (i === file.hunks!.length - 1) {
        items.push(createLastHunkFooter(expandableHunk));
      } else {
        items.push(createHunkFooter(expandableHunk));
      }
    }
    return items;
  };

  const markHunkConflicts = (hunk: HunkType) => {
    let inConflict = false;
    hunk.changes.forEach((item) => {
      if (item.content === "<<<<<<< HEAD") {
        inConflict = true;
      }
      if (inConflict) {
        item.type = "conflict";
      }
      if (item.content.startsWith(">>>>>>>")) {
        inConflict = false;
      }
    });
  };

  const getAnchorId = (file: FileDiff) => {
    let path: string;
    if (file.type === "delete") {
      path = file.oldPath;
    } else {
      path = file.newPath;
    }
    return escapeWhitespace(path);
  };

  const renderFileTitle = (file: FileDiff) => {
    if (file.oldPath !== file.newPath && (file.type === "copy" || file.type === "rename")) {
      return (
        <>
          {file.oldPath} <Icon name="arrow-right" color="inherit" /> {file.newPath}
        </>
      );
    } else if (file.type === "delete") {
      return file.oldPath;
    }
    return file.newPath;
  };

  const hoverFileTitle = (file: FileDiff): string => {
    if (file.oldPath !== file.newPath && (file.type === "copy" || file.type === "rename")) {
      return `${file.oldPath} > ${file.newPath}`;
    } else if (file.type === "delete") {
      return file.oldPath;
    }
    return file.newPath;
  };

  const renderChangeTag = (file: FileDiff) => {
    if (!file.type) {
      return;
    }
    const key = "diff.changes." + file.type;
    let value = t(key);
    if (key === value) {
      value = file.type;
    }

    const color = value === "added" ? "success" : value === "deleted" ? "danger" : "info";
    return (
      <ChangeTypeTag
        className={classNames("has-text-weight-normal")}
        rounded={true}
        outlined={true}
        color={color}
        label={value}
      />
    );
  };

  const fileAnnotations = fileAnnotationFactory ? fileAnnotationFactory(file) : null;
  const innerContent = (
    <div className="panel-block is-paddingless">
      {fileAnnotations}
      <TokenizedDiffView className={viewType} viewType={viewType} file={file}>
        {(hunks: HunkType[]) =>
          hunks?.map((hunk, n) => {
            return renderHunk(file, getHunk(file, hunks, n, expandTop, expandBottom), n);
          })
        }
      </TokenizedDiffView>
    </div>
  );
  let icon = "angle-right";
  let body = null;
  if (!collapsed) {
    icon = "angle-down";
    body = innerContent;
  }
  const collapseIcon = hasContent ? <Icon name={icon} color="inherit" /> : null;
  const fileControls = fileControlFactory ? fileControlFactory(file, setCollapsed) : null;
  const openInFullscreen = file?.hunks?.length ? (
    <OpenInFullscreenButton
      modalTitle={file.type === "delete" ? file.oldPath : file.newPath}
      modalBody={<MarginlessModalContent>{innerContent}</MarginlessModalContent>}
    />
  ) : null;
  const sideBySideToggle = file?.hunks?.length && (
    <MenuContext.Consumer>
      {({ setCollapsed: setMenuCollapsed }) => (
        <DiffButton
          icon={sideBySide ? "align-left" : "columns"}
          tooltip={t(sideBySide ? "diff.combined" : "diff.sideBySide")}
          onClick={() =>
            toggleSideBySide(() => {
              if (sideBySide) {
                setMenuCollapsed(true);
              }
            })
          }
        />
      )}
    </MenuContext.Consumer>
  );
  const headerButtons = (
    <AlignRight className={classNames("level-right", "is-flex")}>
      <ButtonGroup>
        {sideBySideToggle}
        {openInFullscreen}
        {fileControls}
      </ButtonGroup>
    </AlignRight>
  );

  let errorModal;
  if (expansionError) {
    errorModal = (
      <Modal
        title={t("diff.expansionFailed")}
        closeFunction={() => setExpansionError(null)}
        body={<ErrorNotification error={expansionError} />}
        active={true}
      />
    );
  }

  return (
    <DiffFilePanel
      className={classNames("panel", "is-size-6")}
      collapsed={(file && file.isBinary) || collapsed}
      id={getAnchorId(file)}
    >
      {errorModal}
      <div className="panel-heading">
        <div className={classNames("level", "is-flex-wrap-wrap")}>
          <FullWidthTitleHeader
            className={classNames("level-left", "is-flex", "has-cursor-pointer")}
            onClick={toggleCollapse}
            title={hoverFileTitle(file)}
          >
            {collapseIcon}
            <TitleWrapper className={classNames("is-ellipsis-overflow", "is-size-6")}>
              {renderFileTitle(file)}
            </TitleWrapper>
            {renderChangeTag(file)}
          </FullWidthTitleHeader>
          {headerButtons}
        </div>
      </div>
      {body}
    </DiffFilePanel>
  );
};

export default DiffFile;
