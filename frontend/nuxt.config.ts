// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: [`/assets/css/main.css`, `/assets/css/customFonts.css`, `/assets/css/animations.css`],
    app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: '/WEKALOGO.png' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8080',
    },
  },
})

