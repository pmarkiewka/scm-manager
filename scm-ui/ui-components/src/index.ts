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

import * as validation from "./validation";
import * as repositories from "./repositories";

import { urls } from "@scm-manager/ui-api";

// not sure if it is required
import {
  AnnotationFactory,
  AnnotationFactoryContext,
  BaseContext,
  Change,
  DiffEventContext,
  DiffEventHandler,
  File,
  FileChangeType,
  Hunk,
} from "./repos";

export { validation, repositories };

export { default as DateFromNow } from "./DateFromNow";
export { default as DateShort } from "./DateShort";
export { default as useDateFormatter } from "./useDateFormatter";
export { default as Duration } from "./Duration";
export { default as ErrorNotification } from "./ErrorNotification";
export { default as ErrorPage } from "./ErrorPage";
export { default as Icon } from "./Icon";
export { default as Image } from "./Image";
export { default as Loading } from "./Loading";
export { default as Logo } from "./Logo";
export { default as MailLink } from "./MailLink";
export { default as Notification } from "./Notification";
export { default as Paginator } from "./Paginator";
export { default as LinkPaginator } from "./LinkPaginator";
export { default as StatePaginator } from "./StatePaginator";

export { default as DangerZone } from "./DangerZone";
export { default as FileSize } from "./FileSize";
export { default as ProtectedRoute } from "./ProtectedRoute";
export { default as Help } from "./Help";
export { default as HelpIcon } from "./HelpIcon";
export { default as Tag } from "./Tag";
export { default as Tooltip } from "./Tooltip";
export { default as Autocomplete } from "./Autocomplete";
export { default as GroupAutocomplete } from "./GroupAutocomplete";
export { default as UserAutocomplete } from "./UserAutocomplete";
export { default as BranchSelector } from "./BranchSelector";
export { default as Breadcrumb } from "./Breadcrumb";
export { default as MarkdownView } from "./markdown/MarkdownView";
export { default as PdfViewer } from "./PdfViewer";
export { default as SyntaxHighlighter } from "./SyntaxHighlighter";
export { default as ErrorBoundary } from "./ErrorBoundary";
export { default as OverviewPageActions } from "./OverviewPageActions";
export { default as CardColumnGroup } from "./CardColumnGroup";
export { default as CreateTagModal } from "./modals/CreateTagModal";
export { default as CardColumn } from "./CardColumn";
export { default as CardColumnSmall } from "./CardColumnSmall";
export { default as CommaSeparatedList } from "./CommaSeparatedList";
export { default as SplitAndReplace, Replacement } from "./SplitAndReplace";
export { regExpPattern as changesetShortLinkRegex } from "./markdown/remarkChangesetShortLinkParser";
export * from "./markdown/PluginApi";
export * from "./devices";
export { default as copyToClipboard } from "./CopyToClipboard";
export { createA11yId } from "./createA11yId";

export { default as comparators } from "./comparators";

export { isDevBuild, createAttributesForTesting } from "./devBuild";
export * from "./avatar";
export * from "./buttons";
export * from "./config";
export * from "./forms";
export * from "./layout";
export * from "./modals";
export * from "./navigation";
export * from "./repos";
export * from "./table";
export * from "./toast";
export * from "./popover";
export * from "./search";
export * from "./markdown/markdownExtensions";

export {
  File,
  FileChangeType,
  Hunk,
  Change,
  BaseContext,
  AnnotationFactory,
  AnnotationFactoryContext,
  DiffEventHandler,
  DiffEventContext,
};

// Re-export from ui-api
export { apiClient } from "@scm-manager/ui-api";
export {
  Violation,
  AdditionalMessage,
  BackendErrorContent,
  BackendError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  MissingLinkError,
  createBackendError,
  isBackendError,
  TOKEN_EXPIRED_ERROR_CODE,
} from "@scm-manager/ui-api";

export { urls };
export const getPageFromMatch = urls.getPageFromMatch;
