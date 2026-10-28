package com.aegis.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "OAuth authorization URL response")
public class OAuthUrlResponseDTO {

    @Schema(description = "Google OAuth authorization URL with generated state and scopes", example = "https://accounts.google.com/o/oauth2/v2/auth?...")
    private String authorizationUrl;

    @Schema(description = "Generated state parameter for cross-checking", example = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d")
    private String state;

    public OAuthUrlResponseDTO() {
    }

    public OAuthUrlResponseDTO(String authorizationUrl, String state) {
        this.authorizationUrl = authorizationUrl;
        this.state = state;
    }

    public String getAuthorizationUrl() {
        return authorizationUrl;
    }

    public void setAuthorizationUrl(String authorizationUrl) {
        this.authorizationUrl = authorizationUrl;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }
}
