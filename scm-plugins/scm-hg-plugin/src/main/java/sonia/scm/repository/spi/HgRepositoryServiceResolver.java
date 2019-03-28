/**
 * Copyright (c) 2010, Sebastian Sdorra
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 3. Neither the name of SCM-Manager; nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
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
 *
 * http://bitbucket.org/sdorra/scm-manager
 *
 */



package sonia.scm.repository.spi;

import com.google.inject.Inject;
import sonia.scm.plugin.Extension;
import sonia.scm.repository.HgHookManager;
import sonia.scm.repository.HgRepositoryHandler;
import sonia.scm.repository.Repository;
import sonia.scm.security.AccessTokenBuilderFactory;

/**
 *
 * @author Sebastian Sdorra
 */
@Extension
public class HgRepositoryServiceResolver implements RepositoryServiceResolver
{

  private final HgRepositoryHandler handler;
  private final HgHookManager hookManager;
  private final AccessTokenBuilderFactory accessTokenBuilderFactory;

  @Inject
  public HgRepositoryServiceResolver(HgRepositoryHandler handler,
                                     HgHookManager hookManager, AccessTokenBuilderFactory accessTokenBuilderFactory)
  {
    this.handler = handler;
    this.hookManager = hookManager;
    this.accessTokenBuilderFactory = accessTokenBuilderFactory;
  }

  @Override
  public HgRepositoryServiceProvider resolve(Repository repository) {
    HgRepositoryServiceProvider provider = null;

    if (HgRepositoryHandler.TYPE_NAME.equalsIgnoreCase(repository.getType())) {
      provider = new HgRepositoryServiceProvider(handler, hookManager, repository, accessTokenBuilderFactory);
    }

    return provider;
  }
}
