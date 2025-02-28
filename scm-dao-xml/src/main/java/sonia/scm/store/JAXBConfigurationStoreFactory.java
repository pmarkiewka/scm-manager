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

package sonia.scm.store;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import sonia.scm.SCMContextProvider;
import sonia.scm.repository.RepositoryLocationResolver;
import sonia.scm.repository.RepositoryReadOnlyChecker;

/**
 * JAXB implementation of {@link ConfigurationStoreFactory}.
 *
 * @author Sebastian Sdorra
 */
@Singleton
public class JAXBConfigurationStoreFactory extends FileBasedStoreFactory implements ConfigurationStoreFactory {

  /**
   * Constructs a new instance.
   *
   * @param repositoryLocationResolver Resolver to get the repository Directory
   */
  @Inject
  public JAXBConfigurationStoreFactory(SCMContextProvider contextProvider, RepositoryLocationResolver repositoryLocationResolver, RepositoryReadOnlyChecker readOnlyChecker) {
    super(contextProvider, repositoryLocationResolver, Store.CONFIG, readOnlyChecker);
  }

  @Override
  public <T> JAXBConfigurationStore<T> getStore(TypedStoreParameters<T> storeParameters) {
    TypedStoreContext<T> context = TypedStoreContext.of(storeParameters);
    return new JAXBConfigurationStore<>(
      context,
      storeParameters.getType(),
      getStoreLocation(storeParameters.getName().concat(StoreConstants.FILE_EXTENSION),
        storeParameters.getType(),
        storeParameters.getRepositoryId()),
      () -> mustBeReadOnly(storeParameters)
    );
  }
}
