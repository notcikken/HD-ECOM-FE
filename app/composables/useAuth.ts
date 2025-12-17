import {
  login as loginApi,
  register as registerApi,
  getUserInfo as getUserInfoApi,
} from "~/services/authService";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "~/types/auth";

export const useAuth = () => {
  const errorMessage = ref<string>("");
  const isLoading = ref<boolean>(false);
  const token = useCookie<string | null>("auth-token");
  const user = useCookie<any | null>("user-data");

  const setToken = (t: string | null) => {
    token.value = t ?? null;
  };

  const setUser = (u: any | null) => {
    user.value = u ?? null;
  };

  const login = async (data: LoginRequest) => {
    isLoading.value = true;
    errorMessage.value = "";
    try {
      const response: LoginResponse = await loginApi(data);

      const tokenValue = response.data.token;
      const userData = response.data.user;

      if (tokenValue) {
        setToken(String(tokenValue));
        if (userData) setUser(userData);

        // decide redirect path based on role if caller prefers auto-redirect
        const role = userData.role;
        let redirectTo = "/";
        
        if (role === 0 || role === "admin") {
          redirectTo = "/dashboard";
        } else if (role === 3 || role === "support") {
          redirectTo = "/dashboard-support/assigned-tickets";
        }

        isLoading.value = false;
        return { success: true, redirectTo, response };
      }

      // no token -> treat as failure
      errorMessage.value =
        response.message || "Login gagal. Silakan coba lagi.";
      isLoading.value = false;
      return { success: false, response };
    } catch (err: any) {
      // map common error shapes to user-friendly message
      if (err.response.status === 401) {
        errorMessage.value = "Email atau kata sandi salah.";
      } else if (err.response.status === 422) {
        const validationErrors = err.response.data.errors || err.data.errors;
        if (validationErrors) {
          errorMessage.value = Object.values(validationErrors)
            .flat()
            .join(", ");
        } else {
          errorMessage.value = "Data yang dimasukkan tidak valid.";
        }
      } else if (err.response.status >= 500) {
        errorMessage.value =
          "Terjadi kesalahan server. Silakan coba lagi nanti.";
      } else {
        errorMessage.value =
          err.response.data.message || "Terjadi kesalahan. Silakan coba lagi.";
      }

      isLoading.value = false;
      return { success: false, error: errorMessage.value, err };
    }
  };

  const register = async (data: RegisterRequest) => {
    isLoading.value = true;
    errorMessage.value = "";
    try {
      const response: RegisterResponse = await registerApi(data);

      const tokenValue = response.data.token;
      const userData = response.data.user;

      if (tokenValue) {
        setToken(String(tokenValue));
        if (userData) setUser(userData);
        isLoading.value = false;
        return { success: true, response };
      }

      errorMessage.value =
        response.message || "Pendaftaran gagal. Silakan coba lagi.";
      isLoading.value = false;
      return { success: false, response };
    } catch (err: any) {
      errorMessage.value = "Registration failed. Please try again.";
      isLoading.value = false;
      return { success: false, err };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    navigateTo("/login");
  };

  const fetchUserInfo = async () => {
    if (!token.value) return null;

    try {
      const response = await getUserInfoApi(token.value);
      if (response.data) {
        setUser(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      return null;
    }
  };

  return {
    errorMessage,
    isLoading,
    token,
    user,
    setToken,
    setUser,
    login,
    register,
    logout,
    fetchUserInfo,
  };
};
