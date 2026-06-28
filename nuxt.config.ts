// https://nuxt.com/docs/api/configuration/nuxt-config
const isProd = process.env.NODE_ENV === "production"

export default defineNuxtConfig({
  devtools: { enabled: false },
  compatibilityDate: '2025-05-17',
  css: ["~/assets/css/main.css"],

  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      title: "Dodo Dodge",
      link: [
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon.png",
        },
      ],
    },
  },

  imports: {
    dirs: [
      'composables/game',
      'composables/scores',
      'composables/storage',
      'utils/canvas',
      'utils/platform',
      'utils/helpers',
    ],
  },

  vite: {
    optimizeDeps: {
      include: [
        "@vercel/analytics",
        "@vueuse/core",
        "kaplay",
        "mitt",
        "valibot",
      ],
    },
    build: {
      minify: "terser",
    },
  },

  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
      autoprefixer: {},
    },
  },

  runtimeConfig: {
    public: {
      words: process.env.NUXT_WORDS,
      version: process.env.NUXT_APP_VERSION,
    },
  },

  modules: ["@pinia/nuxt", "nuxt-security"],

  security: {
    // options
    corsHandler: {
      origin: ["localhost", "game.mscc.mu", "dodododge.vercel.app"],
    },
    headers: {
      contentSecurityPolicy: {
        "base-uri": ["'none'"],
        "font-src": ["'self'", "https:", "data:"],
        "form-action": ["'self'"],
        "frame-ancestors": ["'self'"],
        "img-src": ["'self'", "data:"],
        "object-src": ["'none'"],
        "script-src-attr": ["'none'"],
        "style-src": ["'self'", "https:", "'unsafe-inline'"],
        "script-src": [
          "'self'",
          "https:",
          "'unsafe-inline'",
          "'strict-dynamic'",
          "'nonce-{{nonce}}'",
        ],
        "upgrade-insecure-requests": isProd,
        "frame-src": ["'self'", "https:"],
      },
      strictTransportSecurity: isProd,
    },
  },
});