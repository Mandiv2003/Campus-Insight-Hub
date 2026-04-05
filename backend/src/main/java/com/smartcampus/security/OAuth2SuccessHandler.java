package com.smartcampus.security;

import com.smartcampus.config.AppProperties;
import com.smartcampus.model.User;
import com.smartcampus.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AppProperties appProperties;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email      = oAuth2User.getAttribute("email");
        String name       = oAuth2User.getAttribute("name");
        String providerId = oAuth2User.getAttribute("sub");
        String avatarUrl  = oAuth2User.getAttribute("picture");

        log.debug("OAuth2 login success for: {}", email);

        User user  = userService.upsertGoogleUser(email, name, providerId, avatarUrl);
        String jwt = jwtTokenProvider.generateToken(user);

        String redirectUrl = appProperties.oauth2().redirectUri() + "?token=" + jwt;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
