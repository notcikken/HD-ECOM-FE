export default defineNuxtRouteMiddleware((to, from) => {
    const { user, token } = useAuth();

    const tokenValue = token?.value ?? null;
    const userValue = user?.value ?? null;

    // If no token, redirect to login
    if (!tokenValue) {
        return navigateTo("/login");
    }

    // Check if user has support role (role = 1 for support)
    const isSupport = userValue?.role === "support" || userValue?.role === "1";

    if (!isSupport) {
        // Return 404 error for non-support users to hide the existence of these pages
        throw createError({
            statusCode: 404,
            statusMessage: "Page Not Found",
            fatal: false,
        });
    }

    // If support user trying to access login/signup, redirect to dashboard-support
    if (to.path === "/login" || to.path === "/signup") {
        return navigateTo("/dashboard-support/assigned-tickets");
    }
});
