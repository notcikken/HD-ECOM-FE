export default defineNuxtRouteMiddleware((to, from) => {
  const { user, token } = useAuth();

  const tokenValue = token?.value ?? null;
  const userValue = user?.value ?? null;

  // If no token, redirect to login
  if (!tokenValue) {
    return navigateTo("/login");
  }

  const isSuperAdmin = userValue?.role === 0 || userValue?.role === "0";

  if (isSuperAdmin) {
    // If trying to access login/signup, redirect to dashboard
    if (to.path === "/login" || to.path === "/signup") {
      return navigateTo("/dashboard");
    }
    // allow access
    return;
  } else {
    // For non-admin users, prevent access to dashboard
    if (to.path.startsWith("/dashboard")) {
      return navigateTo("/");
    }
  }
});
