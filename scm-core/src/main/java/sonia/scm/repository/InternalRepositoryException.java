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

import sonia.scm.ContextEntry;
import sonia.scm.ExceptionWithContext;

import java.util.List;

public class InternalRepositoryException extends ExceptionWithContext {

  public static final String CODE = "8LRncum0S1";

  public InternalRepositoryException(ContextEntry.ContextBuilder context, String message) {
    this(context, message, null);
  }

  public InternalRepositoryException(ContextEntry.ContextBuilder context, String message, Exception cause) {
    this(context.build(), message, cause);
  }

  public InternalRepositoryException(Repository repository, String message) {
    this(ContextEntry.ContextBuilder.entity(repository), message, null);
  }

  public InternalRepositoryException(Repository repository, String message, Exception cause) {
    this(ContextEntry.ContextBuilder.entity(repository), message, cause);
  }

  public InternalRepositoryException(List<ContextEntry> context, String message, Exception cause) {
    super(context, message, cause);
  }

  @Override
  public String getCode() {
    return CODE;
  }
}
