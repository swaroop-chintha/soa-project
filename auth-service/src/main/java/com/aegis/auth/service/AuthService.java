package com.aegis.auth.service;

import com.aegis.auth.dto.LoginRequestDTO;
import com.aegis.auth.dto.LoginResponseDTO;
import com.aegis.auth.dto.OAuthCallbackRequestDTO;
import com.aegis.auth.dto.OAuthUrlResponseDTO;
import com.aegis.auth.dto.RegisterRequestDTO;

public interface AuthService {
    LoginResponseDTO login(LoginRequestDTO loginRequest);
    LoginResponseDTO register(RegisterRequestDTO registerRequest);
    OAuthUrlResponseDTO getGoogleAuthorizationUrl();
    LoginResponseDTO processGoogleOAuthCallback(OAuthCallbackRequestDTO callbackRequest);
}

