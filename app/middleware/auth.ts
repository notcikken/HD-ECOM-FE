export default defineNuxtRouteMiddleware((to, from) => {
  const { getUser, getToken } = useAuth();

  const token = getToken();
  const user = getUser();

  // If no token, redirect to login
  if (!token) {
    return navigateTo("/login");
  }

  // Check if user has superadmin role (role: 0)
  if (user?.role === 0 || user?.role === "0") {
    // If trying to access login page, redirect to dashboard
    if (to.path === "/login" || to.path === "/signup") {
      return navigateTo("/dashboard");
    }
  } else {
    // For non-admin users, prevent access to dashboard
    if (to.path.startsWith("/dashboard")) {
      return navigateTo("/");
    }
  }
});
