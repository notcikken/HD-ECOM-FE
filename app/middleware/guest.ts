export default defineNuxtRouteMiddleware((to, from) => {
  const { user, token } = useAuth();

  const tokenValue = token?.value ?? null;
  const userValue = user?.value ?? null;

  // If user is already logged in and is superadmin, redirect to dashboard
  if (tokenValue && (userValue?.role === 0 || userValue?.role === "0")) {
    return navigateTo("/dashboard");
  }

  // If user is logged in but not admin, redirect to home
  if (
    tokenValue &&
    userValue &&
    userValue?.role !== 0 &&
    userValue?.role !== "0"
  ) {
    return navigateTo("/");
  }
});
