// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  app: {
    head: {
      title: "Secondcycle Helpdesk",
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: process.env.NUXT_PUBLIC_FAVICON_URL,
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      authBase: process.env.NUXT_PUBLIC_AUTH_BASE || "http://localhost:8000",
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:8080",
      wsBase: process.env.NUXT_PUBLIC_WS_BASE || "ws://localhost:8080",
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  modules: ["@nuxt/eslint"],
});
