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

package sonia.scm.repository;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

class ModificationsTest {

  public static final Modifications MODIFICATIONS = new Modifications("123",
    new Modification.Added("added"),
    new Modification.Removed("removed"),
    new Modification.Modified("modified"),
    new Modification.Renamed("rename from", "rename to"),
    new Modification.Copied("copy from", "copy to")
  );

  @Test
  void shouldFindAddedFilesAsEffected() {
    assertThat(MODIFICATIONS.getEffectedPaths())
      .contains("added");
  }

  @Test
  void shouldFindRemovedFilesAsEffected() {
    assertThat(MODIFICATIONS.getEffectedPaths())
      .contains("removed");
  }

  @Test
  void shouldFindModifiedFilesAsEffected() {
    assertThat(MODIFICATIONS.getEffectedPaths())
      .contains("modified");
  }

  @Test
  void shouldFindRenamedFilesAsEffected() {
    assertThat(MODIFICATIONS.getEffectedPaths())
      .contains("rename from", "rename to");
  }

  @Test
  void shouldFindTargetOfCopiedFilesAsEffected() {
    assertThat(MODIFICATIONS.getEffectedPaths())
      .contains("copy to")
      .doesNotContain("copy from");
  }
}
