package sonia.scm.boot;

import com.google.inject.AbstractModule;
import com.google.inject.throwingproviders.ThrowingProviderBinder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import sonia.scm.ClassOverrides;
import sonia.scm.SCMContext;
import sonia.scm.SCMContextProvider;
import sonia.scm.io.DefaultFileSystem;
import sonia.scm.io.FileSystem;
import sonia.scm.plugin.PluginLoader;
import sonia.scm.repository.RepositoryLocationResolver;
import sonia.scm.repository.xml.PathBasedRepositoryLocationResolver;
import sonia.scm.security.CipherHandler;
import sonia.scm.security.CipherUtil;
import sonia.scm.security.DefaultKeyGenerator;
import sonia.scm.security.KeyGenerator;
import sonia.scm.store.BlobStoreFactory;
import sonia.scm.store.ConfigurationEntryStoreFactory;
import sonia.scm.store.ConfigurationStoreFactory;
import sonia.scm.store.DataStoreFactory;
import sonia.scm.store.FileBlobStoreFactory;
import sonia.scm.store.JAXBConfigurationEntryStoreFactory;
import sonia.scm.store.JAXBConfigurationStoreFactory;
import sonia.scm.store.JAXBDataStoreFactory;

public class BootstrapModule extends AbstractModule {

  private static final Logger LOG = LoggerFactory.getLogger(BootstrapModule.class);

  private final ClassOverrides overrides;
  private final PluginLoader pluginLoader;

  BootstrapModule(PluginLoader pluginLoader) {
    this.overrides = ClassOverrides.findOverrides(pluginLoader.getUberClassLoader());
    this.pluginLoader = pluginLoader;
  }

  @Override
  protected void configure() {
    install(ThrowingProviderBinder.forModule(this));

    SCMContextProvider context = SCMContext.getContext();

    bind(SCMContextProvider.class).toInstance(context);

    bind(KeyGenerator.class).to(DefaultKeyGenerator.class);

    bind(RepositoryLocationResolver.class).to(PathBasedRepositoryLocationResolver.class);

    bind(FileSystem.class, DefaultFileSystem.class);

    // note CipherUtil uses an other generator
    bind(CipherHandler.class).toInstance(CipherUtil.getInstance().getCipherHandler());

    // bind core
    bind(ConfigurationStoreFactory.class, JAXBConfigurationStoreFactory.class);
    bind(ConfigurationEntryStoreFactory.class, JAXBConfigurationEntryStoreFactory.class);
    bind(DataStoreFactory.class, JAXBDataStoreFactory.class);
    bind(BlobStoreFactory.class, FileBlobStoreFactory.class);
    bind(PluginLoader.class).toInstance(pluginLoader);
  }

  private <T> void bind(Class<T> clazz, Class<? extends T> defaultImplementation) {
    Class<? extends T> implementation = find(clazz, defaultImplementation);
    LOG.debug("bind {} to {}", clazz, implementation);
    bind(clazz).to(implementation);
  }

  private <T> Class<? extends T> find(Class<T> clazz, Class<? extends T> defaultImplementation) {
    Class<? extends T> implementation = overrides.getOverride(clazz);

    if (implementation != null) {
      LOG.info("found override {} for {}", implementation, clazz);
    } else {
      implementation = defaultImplementation;

      LOG.trace(
        "no override available for {}, using default implementation {}",
        clazz, implementation);
    }

    return implementation;
  }
}