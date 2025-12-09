import type { Response } from "./response";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string | number;
  created_at?: string;
  updated_at?: string;
}

export type LoginResponse = Response<{ token: string; user: User }>;
export type RegisterResponse = Response<{ token: string; user: User }>;
