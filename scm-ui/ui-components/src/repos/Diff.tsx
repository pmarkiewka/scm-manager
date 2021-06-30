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
import React, { FC, useEffect, useRef } from "react";
import DiffFile from "./DiffFile";
import { DiffObjectProps, FileControlFactory } from "./DiffTypes";
import { FileDiff } from "@scm-manager/ui-types";
import { escapeWhitespace } from "./diffs";
import Notification from "../Notification";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

type Props = DiffObjectProps & {
  diff: FileDiff[];
  fileControlFactory?: FileControlFactory;
};
function getAnchorSelector(uriHashContent: string) {
  return "#" + escapeWhitespace(decodeURIComponent(uriHashContent));
}

const Diff: FC<Props> = ({ diff, ...fileProps }) => {
  const [t] = useTranslation("repos");
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // we have to use componentDidUpdate, because we have to wait until all
    // children are rendered and componentDidMount is called before the
    // changeset content was rendered.
    const hash = location.hash;
    const match = hash && hash.match(/^#diff-(.*)$/);
    if (contentRef.current && match) {
      const selector = getAnchorSelector(match[1]);
      const element = contentRef.current.querySelector(selector);
      if (element && element.scrollIntoView) {
        element.scrollIntoView();
      }
    }
  }, [contentRef, location]);

  return (
    <div ref={contentRef}>
      {diff.length === 0 ? (
        <Notification type="info">{t("diff.noDiffFound")}</Notification>
      ) : (
        diff.map((file, index) => <DiffFile key={index} file={file} {...fileProps} />)
      )}
    </div>
  );
};

export default Diff;
