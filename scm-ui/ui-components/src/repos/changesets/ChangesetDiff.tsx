import React from "react";
import { Changeset, Link } from "@scm-manager/ui-types";
import LoadingDiff from "../LoadingDiff";
import Notification from "../../Notification";
import { translate } from "react-i18next";

type Props = {
  changeset: Changeset;
  defaultCollapse?: boolean;

  // context props
  t: (p: string) => string;
};

class ChangesetDiff extends React.Component<Props> {
  isDiffSupported(changeset: Changeset) {
    return !!changeset._links.diff;
  }

  createUrl(changeset: Changeset) {
    if (changeset._links.diff) {
      const link = changeset._links.diff as Link;
      return link.href + "?format=GIT";
    }
    throw new Error("diff link is missing");
  }

  render() {
    const { changeset, defaultCollapse, t } = this.props;
    if (!this.isDiffSupported(changeset)) {
      return (
        <Notification type="danger">
          {t("changeset.diffNotSupported")}
        </Notification>
      );
    } else {
      const url = this.createUrl(changeset);
      return <LoadingDiff url={url} defaultCollapse={defaultCollapse} />;
    }
  }
}

export default translate("repos")(ChangesetDiff);
