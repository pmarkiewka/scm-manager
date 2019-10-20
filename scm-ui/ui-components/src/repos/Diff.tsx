import React from "react";
import DiffFile from "./DiffFile";
import { DiffObjectProps, File } from "./DiffTypes";

type Props = DiffObjectProps & {
  diff: File[];
  defaultCollapse?: boolean;
};

class Diff extends React.Component<Props> {
  static defaultProps: Partial<Props> = {
    sideBySide: false
  };

  render() {
    const { diff, ...fileProps } = this.props;
    return (
      <>
        {diff.map((file, index) => (
          <DiffFile key={index} file={file} {...fileProps} {...this.props} />
        ))}
      </>
    );
  }
}

export default Diff;
