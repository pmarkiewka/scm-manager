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

package sonia.scm.search;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class IndexQueueTaskWrapper<T> implements Runnable {

  private static final Logger LOG = LoggerFactory.getLogger(IndexQueueTaskWrapper.class);

  private final LuceneIndexFactory indexFactory;
  private final IndexParams indexParams;
  private final Iterable<IndexQueueTask<T>> tasks;

  IndexQueueTaskWrapper(LuceneIndexFactory indexFactory, IndexParams indexParams, Iterable<IndexQueueTask<T>> tasks) {
    this.indexFactory = indexFactory;
    this.indexParams = indexParams;
    this.tasks = tasks;
  }

  @Override
  public void run() {
    try (Index<T> index = indexFactory.create(indexParams)) {
      for (IndexQueueTask<T> task : tasks) {
        task.updateIndex(index);
      }
    } catch (Exception e) {
      LOG.warn("failure during execution of index task for index {}", indexParams.getIndex(), e);
    }
  }
}
