package com.smartcampus.security;

import com.smartcampus.config.AppProperties;
import com.smartcampus.service.EmailService;
import com.smartcampus.service.UserService;
import com.smartcampus.service.UserService.UpsertResult;
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
    private final EmailService emailService;

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

        UpsertResult result = userService.upsertGoogleUser(email, name, providerId, avatarUrl);
        if (result.isNew()) {
            emailService.sendWelcome(result.user().getEmail(), result.user().getFullName());
        }
        String jwt = jwtTokenProvider.generateToken(result.user());

        String redirectUrl = appProperties.oauth2().redirectUri() + "?token=" + jwt;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
