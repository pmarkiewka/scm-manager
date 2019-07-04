// @flow
import React from "react";
import { connect } from "react-redux";
import { translate } from "react-i18next";
import { compose } from "redux";
import type { PluginCollection } from "@scm-manager/ui-types";
import {
  Loading,
  Title,
  Subtitle,
  Notification,
  ErrorNotification
} from "@scm-manager/ui-components";
import {
  fetchPluginsByLink,
  getFetchPluginsFailure,
  getPluginCollection,
  isFetchPluginsPending
} from "../modules/plugins";
import PluginsList from "../components/PluginsList";
import { getUiPluginsLink } from "../../../modules/indexResource";

type Props = {
  loading: boolean,
  error: Error,
  collection: PluginCollection,
  baseUrl: string,
  installed: boolean,
  pluginsLink: string,

  // context objects
  t: string => string,

  // dispatched functions
  fetchPluginsByLink: (link: string) => void
};

class PluginsOverview extends React.Component<Props> {
  componentDidMount() {
    const { fetchPluginsByLink, pluginsLink } = this.props;
    fetchPluginsByLink(pluginsLink);
  }

  render() {
    const { loading, error, collection, installed, t } = this.props;

    if (error) {
      return <ErrorNotification error={error} />;
    }

    if (!collection || loading) {
      return <Loading />;
    }

    return (
      <>
        <Title title={t("plugins.title")} />
        <Subtitle
          subtitle={
            installed
              ? t("plugins.installedSubtitle")
              : t("plugins.availableSubtitle")
          }
        />
        {this.renderPluginsList()}
      </>
    );
  }

  renderPluginsList() {
    const { collection, t } = this.props;

    if (collection._embedded && collection._embedded.plugins.length > 0) {
      return <PluginsList plugins={collection._embedded.plugins} />;
    }
    return <Notification type="info">{t("plugins.noPlugins")}</Notification>;
  }
}

const mapStateToProps = state => {
  const collection = getPluginCollection(state);
  const loading = isFetchPluginsPending(state);
  const error = getFetchPluginsFailure(state);
  const pluginsLink = getUiPluginsLink(state);

  return {
    collection,
    loading,
    error,
    pluginsLink
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchPluginsByLink: (link: string) => {
      dispatch(fetchPluginsByLink(link));
    }
  };
};

export default compose(
  translate("admin"),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(PluginsOverview);
