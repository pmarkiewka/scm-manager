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
import * as React from "react";
import { DisplayedUser } from "@scm-manager/ui-types";
import { Help, Tag } from "../index";

type Props = {
  items: DisplayedUser[];
  label: string;
  helpText?: string;
  onRemove: (p: DisplayedUser[]) => void;
};

export default class TagGroup extends React.Component<Props> {
  render() {
    const { items, label, helpText } = this.props;
    let help = null;
    if (helpText) {
      help = <Help className="is-relative" message={helpText} />;
    }
    return (
      <div className="field is-grouped is-grouped-multiline">
        {label && items ? (
          <div className="control">
            <strong>
              {label}
              {help}
              {items.length > 0 ? ":" : ""}
            </strong>
          </div>
        ) : (
          ""
        )}
        {items.map((item, key) => {
          return (
            <div className="control" key={key}>
              <div className="tags has-addons">
                <Tag color="info" outlined={true} label={item.displayName} onRemove={() => this.removeEntry(item)} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  removeEntry = (item: DisplayedUser) => {
    const newItems = this.props.items.filter((name) => name !== item);
    this.props.onRemove(newItems);
  };
}
