import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "~/types/auth";

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const config = useRuntimeConfig();
  const base = (config.public?.authBase || "").replace(/\/+$/, "");
  const url = `${base}/api/auth`;
  return await $fetch(`${url}/login`, {
    method: "POST",
    body: data,
  });
};

export const register = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {
  const config = useRuntimeConfig();
  const base = (config.public?.authBase || "").replace(/\/+$/, "");
  const url = `${base}/api/auth`;
  return await $fetch(`${url}/register`, {
    method: "POST",
    body: data,
  });
};
