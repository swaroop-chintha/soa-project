import { api } from './api';
import { LoginRequest, LoginResponse, RegisterRequest, UserSession } from '../types/auth';

export const JWT_STORAGE_KEY = 'aegis_jwt_token';
export const USER_STORAGE_KEY = 'user';

function saveSession(data: LoginResponse): UserSession {
  if (data.token) {
    localStorage.setItem(JWT_STORAGE_KEY, data.token);
    localStorage.setItem('token', data.token); // maintain backward compat
    const session: UserSession = {
      token: data.token,
      username: data.username,
      role: data.role
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session));
    return session;
  }
  throw new Error('Authentication response did not contain a valid JWT token');
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    const data = response.data;
    saveSession(data);
    return data;
  },

  async register(registrationData: RegisterRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/register', registrationData);
    const data = response.data;
    saveSession(data);
    return data;
  },

  async getGoogleAuthUrl(): Promise<{ authorizationUrl: string; state: string }> {
    const response = await api.get<{ authorizationUrl: string; state: string }>('/auth/oauth2/google/url');
    return response.data;
  },

  async handleGoogleCallback(code: string, state: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/oauth2/callback/google', { code, state });
    const data = response.data;
    saveSession(data);
    return data;
  },

  logout(): void {
    localStorage.removeItem(JWT_STORAGE_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  getCurrentUser(): UserSession | null {
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as UserSession;
      } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(JWT_STORAGE_KEY) || localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }
};
