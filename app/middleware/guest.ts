export default defineNuxtRouteMiddleware((to, from) => {
  const { getToken, getUser } = useAuth();

  const token = getToken();
  const user = getUser();

  // If user is already logged in and is superadmin, redirect to dashboard
  if (token && (user?.role === 0 || user?.role === "0")) {
    return navigateTo("/dashboard");
  }

  // If user is logged in but not admin, redirect to home
  if (token && user?.role !== 0 && user?.role !== "0") {
    return navigateTo("/");
  }
});
