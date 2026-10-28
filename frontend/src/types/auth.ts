export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  fullName?: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  username: string;
  role: string;
  expiresInMs: number;
}

export interface UserSession {
  token: string;
  username: string;
  role: string;
}
