package com.aegis.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Controller
@Tag(name = "OAuth Redirect Callback", description = "Catches Google OAuth redirects at /login/oauth2/code/google and forwards them to the frontend callback handler")
public class OAuthRedirectController {

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @GetMapping("/login/oauth2/code/google")
    @Operation(summary = "Legacy/Standard OAuth2 Redirect Endpoint", description = "Receives Google authorization code and state from Google, then redirects browser to the frontend /oauth2/callback page")
    public void handleGoogleOAuthRedirect(
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "error", required = false) String error,
            HttpServletResponse response) throws IOException {

        if (error != null) {
            response.sendRedirect(frontendUrl + "/oauth2/callback?error=" + URLEncoder.encode(error, StandardCharsets.UTF_8));
            return;
        }

        if (code != null && state != null) {
            response.sendRedirect(frontendUrl + "/oauth2/callback?code=" + URLEncoder.encode(code, StandardCharsets.UTF_8) +
                    "&state=" + URLEncoder.encode(state, StandardCharsets.UTF_8));
            return;
        }

        response.sendRedirect(frontendUrl + "/login");
    }
}
