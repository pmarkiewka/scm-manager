//@flow
import React from "react";
import { Hunk, Diff as DiffComponent } from "react-diff-view";
import injectSheets from "react-jss";
import classNames from "classnames";
import {translate} from "react-i18next";

const styles = {
  panel: {
    fontSize: "1rem"
  },
  header: {
    cursor: "pointer"
  },
  title: {
    marginLeft: ".25rem",
    fontSize: "1rem"
  },
  hunkDivider: {
    margin: ".5rem 0"
  }
};

type Props = {
  file: any,
  sideBySide: boolean,
  // context props
  classes: any,
  t: string => string
}

type State = {
  collapsed: boolean
}

class DiffFile extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      collapsed: false
    };
  }

  toggleCollapse = () => {
    this.setState((state) => ({
      collapsed: ! state.collapsed
    }));
  };

  renderHunk = (hunk: any, i: number) => {
    const { classes } = this.props;
    let header = null;
    if (i > 0) {
      header = <hr className={classes.hunkDivider} />;
    }
    return <Hunk key={hunk.content} hunk={hunk} header={header} />;
  };

  renderFileTitle = (file: any) => {
    if (file.oldPath !== file.newPath && (file.type === "copy" || file.type === "rename")) {
      return (<>{file.oldPath} <i className="fa fa-arrow-right" /> {file.newPath}</>);
    } else if (file.type === "delete") {
      return file.oldPath;
    }
    return file.newPath;
  };

  renderChangeTag = (file: any) => {
    const { t } = this.props;
    const key = "diff.changes." + file.type;
    let value = t(key);
    if (key === value) {
      value = file.type;
    }
    return (
      <span className="tag is-info has-text-weight-normal">
        {value}
      </span>
    );
  };

  render() {
    const { file, sideBySide, classes } = this.props;
    const { collapsed } = this.state;
    const viewType = sideBySide ? "split" : "unified";

    let body = null;
    let icon = "fa fa-angle-right";
    if (!collapsed) {
      icon = "fa fa-angle-down";
      body = (
        <div className="panel-block is-paddingless is-size-7">
          <DiffComponent viewType={viewType}>
            { file.hunks.map(this.renderHunk) }
          </DiffComponent>
        </div>
      );
    }

    return (
      <div className={classNames("panel", classes.panel)}>
        <div className={classNames("panel-heading", classes.header)} onClick={this.toggleCollapse}>
          <div className="level">
            <div className="level-left">
              <i className={icon} /><span className={classes.title}>{this.renderFileTitle(file)}</span>
            </div>
            <div className="level-right">
              {this.renderChangeTag(file)}
            </div>
          </div>
        </div>
        {body}
      </div>
    );
  }

}

export default injectSheets(styles)(translate("repos")(DiffFile));