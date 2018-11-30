package sonia.scm.security;

import com.github.sdorra.shiro.ShiroRule;
import com.github.sdorra.shiro.SubjectAware;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.time.Clock;
import java.time.Instant;
import java.util.Collections;
import java.util.Optional;
import java.util.Random;

import static java.time.Duration.ofMinutes;
import static java.util.concurrent.TimeUnit.MINUTES;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SubjectAware(
  username = "user",
  password = "secret",
  configuration = "classpath:sonia/scm/repository/shiro.ini"
)
@RunWith(MockitoJUnitRunner.class)
public class JwtAccessTokenRefresherTest {

  @Rule
  public ShiroRule shiro = new ShiroRule();

  @Mock
  private SecureKeyResolver keyResolver;
  @Mock
  private JwtAccessTokenRefreshStrategy refreshStrategy;
  @Mock
  private Clock clock;

  private KeyGenerator keyGenerator = () -> "key";

  private JwtAccessTokenRefresher refresher;
  private JwtAccessTokenBuilder tokenBuilder;

  @Before
  public void initKeyResolver() {
    byte[] bytes = new byte[256];
    new Random().nextBytes(bytes);
    SecureKey secureKey = new SecureKey(bytes, System.currentTimeMillis());
    when(keyResolver.getSecureKey(any())).thenReturn(secureKey);

    JwtAccessTokenBuilderFactory builderFactory = new JwtAccessTokenBuilderFactory(keyGenerator, keyResolver, Collections.emptySet());
    refresher = new JwtAccessTokenRefresher(builderFactory, refreshStrategy, clock);
    tokenBuilder = builderFactory.create();
    when(clock.instant()).thenAnswer(invocationOnMock -> Instant.now());
    when(refreshStrategy.shouldBeRefreshed(any())).thenReturn(true);

    // set default expiration values
    tokenBuilder
      .expiresIn(5, MINUTES)
      .refreshableFor(10, MINUTES);
  }

  @Test
  public void shouldNotRefreshTokenWithDisabledRefresh() {
    JwtAccessToken oldToken = tokenBuilder
      .refreshableFor(0, MINUTES)
      .build();

    Optional<JwtAccessToken> refreshedToken = refresher.refresh(oldToken);

    assertThat(refreshedToken).isEmpty();
  }

  @Test
  public void shouldNotRefreshTokenWhenTokenExpired() {
    Instant afterNormalExpiration = Instant.now().plus(ofMinutes(6));
    when(clock.instant()).thenReturn(afterNormalExpiration);
    JwtAccessToken oldToken = tokenBuilder.build();

    Optional<JwtAccessToken> refreshedToken = refresher.refresh(oldToken);

    assertThat(refreshedToken).isEmpty();
  }

  @Test
  public void shouldNotRefreshTokenWhenRefreshExpired() {
    Instant afterRefreshExpiration = Instant.now().plus(ofMinutes(2));
    when(clock.instant()).thenReturn(afterRefreshExpiration);
    JwtAccessToken oldToken = tokenBuilder
      .refreshableFor(1, MINUTES)
      .build();

    Optional<JwtAccessToken> refreshedToken = refresher.refresh(oldToken);

    assertThat(refreshedToken).isEmpty();
  }

  @Test
  public void shouldNotRefreshTokenWhenStrategyDoesNotSaySo() {
    JwtAccessToken oldToken = tokenBuilder.build();
    when(refreshStrategy.shouldBeRefreshed(oldToken)).thenReturn(false);

    Optional<JwtAccessToken> refreshedToken = refresher.refresh(oldToken);

    assertThat(refreshedToken).isEmpty();
  }

  @Test
  public void shouldRefreshTokenWithEnabledRefresh() {
    JwtAccessToken oldToken = tokenBuilder.build();
    when(refreshStrategy.shouldBeRefreshed(oldToken)).thenReturn(true);

    Optional<JwtAccessToken> refreshedToken = refresher.refresh(oldToken);

    assertThat(refreshedToken).isNotEmpty();
    assertThat(refreshedToken.get().getClaims())
      .containsEntry(JwtAccessToken.PARENT_TOKEN_ID_CLAIM_KEY, "key");
  }
}
