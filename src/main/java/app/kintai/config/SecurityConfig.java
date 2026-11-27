// 担当：山川さん（ログイン）。変更する前に同じフォルダか担当フォルダの README.md を読み、担当外の人は担当者に相談する
package app.kintai.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * ログイン。管理者（山本さん）1人を環境変数 ADMIN_USER / ADMIN_PASSWORD から作る。
 * 画面（React）からは POST /api/login（username・password）でログインし、/api/** はログインが必要。
 * 安全対策（CSRF）の値は Cookie「XSRF-TOKEN」で渡し、React がヘッダー「X-XSRF-TOKEN」で送り返す。
 * 利用者を増やすときは、users() を DB のユーザー表に置き換える。
 */
@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(a -> a
                    .requestMatchers("/api/login", "/actuator/health").permitAll()
                    .requestMatchers("/api/**").authenticated()
                    .anyRequest().permitAll())   // React の画面ファイル（ログイン前にも表示する）
            .csrf(c -> c.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
            .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
            .formLogin(f -> f.loginPage("/login").loginProcessingUrl("/api/login")
                    .successHandler((req, res, auth) -> res.setStatus(HttpStatus.OK.value()))
                    .failureHandler((req, res, ex) -> res.setStatus(HttpStatus.UNAUTHORIZED.value()))
                    .permitAll())
            .logout(l -> l.logoutUrl("/api/logout")
                    .logoutSuccessHandler((req, res, auth) -> res.setStatus(HttpStatus.OK.value())))
            .exceptionHandling(e -> e.defaultAuthenticationEntryPointFor(
                    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED), new AntPathRequestMatcher("/api/**")));
        return http.build();
    }

    @Bean
    UserDetailsService users(@Value("${app.admin-user}") String user,
                             @Value("${app.admin-password}") String pass, PasswordEncoder enc) {
        return new InMemoryUserDetailsManager(User.withUsername(user).password(enc.encode(pass)).roles("ADMIN").build());
    }

    @Bean
    PasswordEncoder passwordEncoder() { return PasswordEncoderFactories.createDelegatingPasswordEncoder(); }

    /** 毎回 CSRF の値を作って Cookie に入れる（React が読めるように） */
    static final class CsrfCookieFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
                throws ServletException, IOException {
            CsrfToken token = (CsrfToken) req.getAttribute(CsrfToken.class.getName());
            if (token != null) token.getToken();
            chain.doFilter(req, res);
        }
    }
}
