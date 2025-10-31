export const useAuth = () => {
  const getToken = () => {
    try {
      const token = useCookie("auth-token");
      return token.value || null;
    } catch (e) {
      return null;
    }
  };

  const getUser = () => {
    try {
      const userData = useCookie("user-data");
      if (userData.value) {
        if (typeof userData.value === "string") {
          return JSON.parse(userData.value);
        }
        return userData.value;
      }
      return null;
    } catch (e) {
      console.error("Error getting user:", e);
      return null;
    }
  };

  const setToken = (token: string) => {
    const authToken = useCookie("auth-token");
    authToken.value = token;
  };

  const setUser = (user: any) => {
    const userData = useCookie("user-data");
    userData.value = JSON.stringify(user);
  };

  const logout = () => {
    const token = useCookie("auth-token");
    const userData = useCookie("user-data");
    token.value = null;
    userData.value = null;
  };

  return {
    getToken,
    getUser,
    setToken,
    setUser,
    logout,
  };
};
