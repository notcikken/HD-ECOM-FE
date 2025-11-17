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
  id_user: number;
  email: string;
  role: number;
}

export type LoginResponse = Response<{ token: string; user: User }>;
export type RegisterResponse = Response<{ token: string; user: User }>;
