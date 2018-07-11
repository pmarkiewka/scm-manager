/**
 * Copyright (c) 2010, Sebastian Sdorra
 * All rights reserved.
 * <p>
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * <p>
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 * 3. Neither the name of SCM-Manager; nor the names of its
 * contributors may be used to endorse or promote products derived from this
 * software without specific prior written permission.
 * <p>
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED.  IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * <p>
 * http://bitbucket.org/sdorra/scm-manager
 */


package sonia.scm.repository;

//~--- non-JDK imports --------------------------------------------------------

import com.github.sdorra.ssp.PermissionActionCheck;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.google.common.util.concurrent.ThreadFactoryBuilder;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import org.apache.shiro.concurrent.SubjectAwareExecutorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import sonia.scm.ArgumentIsInvalidException;
import sonia.scm.ConfigurationException;
import sonia.scm.HandlerEventType;
import sonia.scm.SCMContextProvider;
import sonia.scm.Type;
import sonia.scm.config.ScmConfiguration;
import sonia.scm.security.KeyGenerator;
import sonia.scm.util.AssertUtil;
import sonia.scm.util.CollectionAppender;
import sonia.scm.util.HttpUtil;
import sonia.scm.util.IOUtil;
import sonia.scm.util.Util;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;

//~--- JDK imports ------------------------------------------------------------

/**
 * Default implementation of {@link RepositoryManager}.
 *
 * @author Sebastian Sdorra
 */
@Singleton
public class DefaultRepositoryManager extends AbstractRepositoryManager {

  private static final String THREAD_NAME = "Hook-%s";
  private static final Logger logger =
    LoggerFactory.getLogger(DefaultRepositoryManager.class);
  private final ScmConfiguration configuration;
  private final ExecutorService executorService;
  private final Map<String, RepositoryHandler> handlerMap;
  private final KeyGenerator keyGenerator;
  private final RepositoryDAO repositoryDAO;
  private final Set<Type> types;
  private RepositoryMatcher repositoryMatcher;
  private NamespaceStrategy namespaceStrategy;


  @Inject
  public DefaultRepositoryManager(ScmConfiguration configuration,
                                  SCMContextProvider contextProvider, KeyGenerator keyGenerator,
                                  RepositoryDAO repositoryDAO, Set<RepositoryHandler> handlerSet,
                                  RepositoryMatcher repositoryMatcher,
                                  NamespaceStrategy namespaceStrategy) {
    this.configuration = configuration;
    this.keyGenerator = keyGenerator;
    this.repositoryDAO = repositoryDAO;
    this.repositoryMatcher = repositoryMatcher;
    this.namespaceStrategy = namespaceStrategy;

    ThreadFactory factory = new ThreadFactoryBuilder()
      .setNameFormat(THREAD_NAME).build();
    this.executorService = new SubjectAwareExecutorService(
      Executors.newCachedThreadPool(factory)
    );

    handlerMap = new HashMap<>();
    types = new HashSet<>();

    for (RepositoryHandler handler : handlerSet) {
      addHandler(contextProvider, handler);
    }
  }


  @Override
  public void close() {
    executorService.shutdown();

    for (RepositoryHandler handler : handlerMap.values()) {
      IOUtil.close(handler);
    }
  }

  public Repository create(Repository repository, boolean initRepository)
    throws RepositoryException {
    logger.info("create repository {} of type {}", repository.getName(), repository.getType());

    RepositoryPermissions.create().check();

    repository.setNamespace(namespaceStrategy.getNamespace());
    logger.info("setting namespace of new repository {} to {}", repository.getName(), repository.getNamespace());

    AssertUtil.assertIsValid(repository);

    if (repositoryDAO.contains(repository.getNamespaceAndName())) {
      throw RepositoryAlreadyExistsException.create(repository);
    }

    repository.setId(keyGenerator.createKey());
    repository.setCreationDate(System.currentTimeMillis());

    if (initRepository) {
      getHandler(repository).create(repository);
    }

    fireEvent(HandlerEventType.BEFORE_CREATE, repository);
    repositoryDAO.add(repository);
    fireEvent(HandlerEventType.CREATE, repository);
    return repository;
  }

  @Override
  public Repository create(Repository repository)
    throws RepositoryException {
    return create(repository, true);
  }

  @Override
  public void delete(Repository repository)
    throws RepositoryException {
    if (logger.isInfoEnabled()) {
      logger.info("delete repository {} of type {}", repository.getName(),
        repository.getType());
    }

    RepositoryPermissions.delete(repository).check();

    if (configuration.isEnableRepositoryArchive() && !repository.isArchived()) {
      throw new RepositoryIsNotArchivedException(
        "Repository could not deleted, because it is not archived.");
    }

    if (repositoryDAO.contains(repository)) {
      fireEvent(HandlerEventType.BEFORE_DELETE, repository);
      getHandler(repository).delete(repository);
      repositoryDAO.delete(repository);
      fireEvent(HandlerEventType.DELETE, repository);
    } else {
      throw new RepositoryNotFoundException(
        "repository ".concat(repository.getName()).concat(" not found"));
    }
  }

  @Override
  public void importRepository(Repository repository)
    throws RepositoryException, IOException {
    create(repository, false);
  }

  @Override
  public void init(SCMContextProvider context) {
  }

  @Override
  public void modify(Repository repository)
    throws RepositoryException {
    if (logger.isInfoEnabled()) {
      logger.info("modify repository {} of type {}", repository.getName(),
        repository.getType());
    }

    AssertUtil.assertIsValid(repository);

    Repository oldRepository = repositoryDAO.get(repository.getNamespaceAndName());

    if (oldRepository != null) {
      RepositoryPermissions.modify(oldRepository).check();
      fireEvent(HandlerEventType.BEFORE_MODIFY, repository, oldRepository);
      repository.setLastModified(System.currentTimeMillis());
      getHandler(repository).modify(repository);
      repositoryDAO.modify(repository);
      fireEvent(HandlerEventType.MODIFY, repository, oldRepository);
    } else {
      throw new RepositoryNotFoundException(
        "repository ".concat(repository.getName()).concat(" not found"));
    }
  }

  @Override
  public void refresh(Repository repository)
    throws RepositoryException {
    AssertUtil.assertIsNotNull(repository);
    RepositoryPermissions.read(repository).check();

    Repository fresh = repositoryDAO.get(repository.getNamespaceAndName());

    if (fresh != null) {
      fresh.copyProperties(repository);
    } else {
      throw new RepositoryNotFoundException(
        "repository ".concat(repository.getName()).concat(" not found"));
    }
  }


  @Override
  public Repository get(String id) {
    AssertUtil.assertIsNotEmpty(id);

    RepositoryPermissions.read(id).check();

    Repository repository = repositoryDAO.get(id);

    if (repository != null) {
      repository = repository.clone();
    }

    return repository;
  }

  @Override
  public Repository get(NamespaceAndName namespaceAndName) {
    AssertUtil.assertIsNotNull(namespaceAndName);
    AssertUtil.assertIsNotEmpty(namespaceAndName.getNamespace());
    AssertUtil.assertIsNotEmpty(namespaceAndName.getName());

    Repository repository = repositoryDAO.get(namespaceAndName);

    if (repository != null) {
      RepositoryPermissions.read(repository).check();
      repository = repository.clone();
    }

    return repository;
  }

  @Override
  public Collection<Repository> getAll(Comparator<Repository> comparator) {
    List<Repository> repositories = Lists.newArrayList();

    PermissionActionCheck<Repository> check = RepositoryPermissions.read();

    for (Repository repository : repositoryDAO.getAll()) {
      if (handlerMap.containsKey(repository.getType())
        && check.isPermitted(repository)) {
        Repository r = repository.clone();

        repositories.add(r);
      }
    }

    if (comparator != null) {
      Collections.sort(repositories, comparator);
    }

    return repositories;
  }

  @Override
  public Collection<Repository> getAll() {
    return getAll(null);
  }


  @Override
  public Collection<Repository> getAll(Comparator<Repository> comparator,
                                       int start, int limit) {
    final PermissionActionCheck<Repository> check =
      RepositoryPermissions.read();

    return Util.createSubCollection(repositoryDAO.getAll(), comparator,
      new CollectionAppender<Repository>() {
        @Override
        public void append(Collection<Repository> collection, Repository item) {
          if (check.isPermitted(item)) {
            collection.add(item.clone());
          }
        }
      }, start, limit);
  }

  @Override
  public Collection<Repository> getAll(int start, int limit) {
    return getAll(null, start, limit);
  }

  @Override
  public Collection<Type> getConfiguredTypes() {
    List<Type> validTypes = Lists.newArrayList();

    for (RepositoryHandler handler : handlerMap.values()) {
      if (handler.isConfigured()) {
        validTypes.add(handler.getType());
      }
    }

    return validTypes;
  }

  @Override
  public Repository getFromRequest(HttpServletRequest request) {
    AssertUtil.assertIsNotNull(request);

    return getFromUri(HttpUtil.getStrippedURI(request));
  }

  @Override
  public Repository getFromUri(String uri) {
    AssertUtil.assertIsNotEmpty(uri);

    if (uri.startsWith(HttpUtil.SEPARATOR_PATH)) {
      uri = uri.substring(1);
    }

    int typeSeparator = uri.indexOf(HttpUtil.SEPARATOR_PATH);
    Repository repository = null;

    if (typeSeparator > 0) {
      String type = uri.substring(0, typeSeparator);

      uri = uri.substring(typeSeparator + 1);
      repository = getFromTypeAndUri(type, uri);
    }

    return repository;
  }

  private Repository getFromTypeAndUri(String type, String uri) {
    if (Strings.isNullOrEmpty(type)) {
      throw new ArgumentIsInvalidException("argument type is required");
    }

    if (Strings.isNullOrEmpty(uri)) {
      throw new ArgumentIsInvalidException("argument uri is required");
    }

    // remove ;jsessionid, jetty bug?
    uri = HttpUtil.removeMatrixParameter(uri);

    Repository repository = null;

    if (handlerMap.containsKey(type)) {
      Collection<Repository> repositories = repositoryDAO.getAll();

      PermissionActionCheck<Repository> check = RepositoryPermissions.read();

      for (Repository r : repositories) {
        if (repositoryMatcher.matches(r, type, uri)) {
          check.check(r);
          repository = r.clone();

          break;
        }
      }
    }

    if ((repository == null) && logger.isDebugEnabled()) {
      logger.debug("could not find repository with type {} and uri {}", type,
        uri);
    }

    return repository;
  }

  @Override
  public RepositoryHandler getHandler(String type) {
    return handlerMap.get(type);
  }

  @Override
  public Long getLastModified() {
    return repositoryDAO.getLastModified();
  }

  @Override
  public Collection<Type> getTypes() {
    return types;
  }

  private void addHandler(SCMContextProvider contextProvider,
                          RepositoryHandler handler) {
    AssertUtil.assertIsNotNull(handler);

    Type type = handler.getType();

    AssertUtil.assertIsNotNull(type);

    if (handlerMap.containsKey(type.getName())) {
      throw new ConfigurationException(
        type.getName().concat("allready registered"));
    }

    if (logger.isInfoEnabled()) {
      logger.info("added RepositoryHandler {} for type {}", handler.getClass(),
        type);
    }

    handlerMap.put(type.getName(), handler);
    handler.init(contextProvider);
    types.add(type);
  }

  private RepositoryHandler getHandler(Repository repository)
    throws RepositoryException {
    String type = repository.getType();
    RepositoryHandler handler = handlerMap.get(type);

    if (handler == null) {
      throw new RepositoryHandlerNotFoundException(
        "could not find handler for ".concat(type));
    } else if (!handler.isConfigured()) {
      throw new RepositoryException("handler is not configured");
    }

    return handler;
  }

}
