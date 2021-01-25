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

package sonia.scm.export;

import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveOutputStream;
import sonia.scm.ContextEntry;
import sonia.scm.repository.Repository;
import sonia.scm.repository.api.ExportFailedException;
import sonia.scm.store.ExportableStore;
import sonia.scm.store.StoreExporter;

import javax.annotation.Nonnull;
import javax.inject.Inject;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FilterOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

public class TarArchiveRepositoryStoreExporter {

  private static final String DATA_STORE = "data";
  private static final String CONFIG_STORE = "config";

  private final StoreExporter storeExporter;

  @Inject
  public TarArchiveRepositoryStoreExporter(StoreExporter storeExporter) {
    this.storeExporter = storeExporter;
  }

  public void export(Repository repository, OutputStream output) {
    try (
      BufferedOutputStream bos = new BufferedOutputStream(output);
      final TarArchiveOutputStream taos = new TarArchiveOutputStream(bos)
    ) {
      List<ExportableStore> exportableStores = storeExporter.listExportableStores(repository);
      for (ExportableStore store : exportableStores) {
        store.export((name, filesize) -> {
          if (isStoreType(store, DATA_STORE)) {
            String storePath = createStorePath(store.getType(), store.getName(), name);
            addEntryToArchive(taos, storePath, filesize);
          } else if (isStoreType(store, CONFIG_STORE)) {
            String storePath = createStorePath(store.getType(), name);
            addEntryToArchive(taos, storePath, filesize);
          }
          return createOutputStream(taos);
        });
      }

    } catch (IOException e) {
      throw new ExportFailedException(
        ContextEntry.ContextBuilder.entity(repository).build(),
        "Could not export repository metadata stores.",
        e
      );
    }
  }

  private boolean isStoreType(ExportableStore store, String dataStore) {
    return dataStore.equalsIgnoreCase(store.getType());
  }

  private void addEntryToArchive(TarArchiveOutputStream taos, String storePath, long filesize) throws IOException {
    TarArchiveEntry entry = new TarArchiveEntry(storePath);
    entry.setSize(filesize);
    taos.putArchiveEntry(entry);
  }

  @Nonnull
  private String createStorePath(String... pathParts) {
    StringBuilder storePath = new StringBuilder("stores");
    for (String part : pathParts) {
      storePath.append(File.separator).append(part);
    }
    return storePath.toString();
  }

  private OutputStream createOutputStream(TarArchiveOutputStream taos) {
    return new CloseArchiveOutputStream(taos);
  }

  static class CloseArchiveOutputStream extends FilterOutputStream {

    private final TarArchiveOutputStream delegate;

    CloseArchiveOutputStream(TarArchiveOutputStream delegate) {
      super(delegate);
      this.delegate = delegate;
    }

    @Override
    public void write(byte[] b, int off, int len) throws IOException {
      delegate.write(b, off, len);
    }

    @Override
    public void close() throws IOException {
      delegate.closeArchiveEntry();
    }
  }
}