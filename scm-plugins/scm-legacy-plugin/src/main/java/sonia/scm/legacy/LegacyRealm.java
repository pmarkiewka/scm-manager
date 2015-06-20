/**
 * Copyright (c) 2014, Sebastian Sdorra All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer. 2. Redistributions in
 * binary form must reproduce the above copyright notice, this list of
 * conditions and the following disclaimer in the documentation and/or other
 * materials provided with the distribution. 3. Neither the name of SCM-Manager;
 * nor the names of its contributors may be used to endorse or promote products
 * derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * http://bitbucket.org/sdorra/scm-manager
 *
 */



package sonia.scm.legacy;

//~--- non-JDK imports --------------------------------------------------------

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Preconditions;

import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.authc.credential.HashedCredentialsMatcher;
import org.apache.shiro.crypto.hash.Sha1Hash;
import org.apache.shiro.realm.AuthenticatingRealm;

import sonia.scm.group.GroupDAO;
import sonia.scm.plugin.Extension;
import sonia.scm.security.DAORealmHelper;
import sonia.scm.user.UserDAO;

//~--- JDK imports ------------------------------------------------------------

import javax.inject.Inject;
import javax.inject.Singleton;

/**
 * Support for SCM-Manager 1.x password hashes.
 *
 * @author Sebastian Sdorra
 * @since 2.0.0
 */
@Extension
@Singleton
public class LegacyRealm extends AuthenticatingRealm
{

  /** Field description */
  @VisibleForTesting
  static final String REALM = "LegacyRealm";

  //~--- constructors ---------------------------------------------------------

  /**
   * Constructs ...
   *
   *
   * @param userDAO
   * @param groupDAO
   */
  @Inject
  public LegacyRealm(UserDAO userDAO, GroupDAO groupDAO)
  {
    this.helper = new DAORealmHelper(REALM, userDAO, groupDAO);
    setAuthenticationTokenClass(UsernamePasswordToken.class);

    HashedCredentialsMatcher matcher = new HashedCredentialsMatcher();

    matcher.setHashAlgorithmName(Sha1Hash.ALGORITHM_NAME);
    matcher.setHashIterations(1);
    matcher.setStoredCredentialsHexEncoded(true);
    setCredentialsMatcher(matcher);
  }

  //~--- methods --------------------------------------------------------------

  /**
   * Method description
   *
   *
   * @param token
   *
   * @return
   *
   * @throws AuthenticationException
   */
  @Override
  protected AuthenticationInfo doGetAuthenticationInfo(
    AuthenticationToken token)
    throws AuthenticationException
  {
    Preconditions.checkArgument(token instanceof UsernamePasswordToken,
      "unsupported token");

    AuthenticationInfo info = null;
    char[] password = ((UsernamePasswordToken) token).getPassword();

    if ((password != null) && (password[0] != '$'))
    {
      info = helper.getAuthenticationInfo(token);
    }

    return info;
  }

  //~--- fields ---------------------------------------------------------------

  /** Field description */
  private final DAORealmHelper helper;
}
