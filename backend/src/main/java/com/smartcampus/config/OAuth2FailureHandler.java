package com.smartcampus.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2FailureHandler.class);

    @Value("${app.oauth2.redirect-uri}")
    private String frontendCallbackUri;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        log.error("OAuth2 authentication failed: {}", exception.getMessage(), exception);

        String errorMessage = URLEncoder.encode(exception.getMessage(), StandardCharsets.UTF_8);
        // Redirect to the React login page with an error parameter so the UI can show it
        String redirectUrl = "http://localhost:5173/login?oauth_error=" + errorMessage;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
