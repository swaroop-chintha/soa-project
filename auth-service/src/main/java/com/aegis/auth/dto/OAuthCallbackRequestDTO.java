package com.aegis.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "OAuth authorization code callback exchange payload")
public class OAuthCallbackRequestDTO {

    @NotBlank(message = "Authorization code is required")
    @Schema(description = "Google authorization code received on frontend callback", example = "4/0AX4XfWh...")
    private String code;

    @NotBlank(message = "OAuth state is required")
    @Schema(description = "OAuth state parameter to prevent CSRF and replay attacks", example = "a7e12c4b-...")
    private String state;

    public OAuthCallbackRequestDTO() {
    }

    public OAuthCallbackRequestDTO(String code, String state) {
        this.code = code;
        this.state = state;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }
}
