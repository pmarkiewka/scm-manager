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
import React, { FC } from "react";
import { useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Branch, Repository } from "@scm-manager/ui-types";
import {
  ChangesetList,
  ErrorNotification,
  urls,
  LinkPaginator,
  Loading,
  Notification,
} from "@scm-manager/ui-components";
import { useChangesets } from "@scm-manager/ui-api";

type Props = {
  repository: Repository;
  branch?: Branch;
};

const usePage = () => {
  const match = useRouteMatch();
  return urls.getPageFromMatch(match);
};

const Changesets: FC<Props> = ({ repository, branch }) => {
  const page = usePage();
  const { isLoading, error, data } = useChangesets(repository, { branch, page: page - 1 });
  const [t] = useTranslation("repos");
  const changesets = data?._embedded.changesets;

  if (error) {
    return <ErrorNotification error={error} />;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (!data || !changesets || changesets.length === 0) {
    return (
      <div className="panel-block">
        <Notification type="info">{t("changesets.noChangesets")}</Notification>
      </div>
    );
  }

  return (
    <>
      <div className="panel-block">
        <ChangesetList repository={repository} changesets={changesets} />
      </div>
      <div className="panel-footer">
        <LinkPaginator page={page} collection={data} />
      </div>
    </>
  );
};

export default Changesets;
