// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      authBase: process.env.AUTH_BASE || "http://localhost:8000",
      apiBase: process.env.API_BASE || "http://localhost:8080",
      wsBase: process.env.WS_BASE || "ws://localhost:8080",
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  modules: ["@nuxt/eslint"],
});
