export default defineNuxtRouteMiddleware(async (to) => {
  const { user, token, fetchUserInfo } = useAuth();

  const tokenValue = token?.value ?? null;

  // If no token, redirect to login
  if (!tokenValue) {
    return navigateTo("/login");
  }

  // Fetch user info if not available
  let userValue = user?.value ?? null;
  if (!userValue && tokenValue) {
    userValue = await fetchUserInfo();
  }

  const isSupport =
    userValue?.role === 3 ||
    userValue?.role === "3" ||
    userValue?.role === "support";

  if (isSupport) {
    // If trying to access login/signup, redirect to dashboard
    if (to.path === "/login" || to.path === "/signup") {
      return navigateTo("/dashboard-support/assigned-tickets");
    }
    // allow access to dashboard routes
    return;
  } else {
    // For non-admin users trying to access dashboard routes
    if (to.path.startsWith("/dashboard-support")) {
      throw createError({
        statusCode: 404,
        statusMessage: "Page Not Found",
        fatal: false,
      });
    }
    // Allow access to other routes
    return;
  }
});
