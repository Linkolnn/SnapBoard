// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  modules: [
    '@pinia/nuxt',
    'nuxt-security'
  ],
  typescript: {
    strict: true,
    shim: false
  },

  security: {
    headers: {
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
      contentSecurityPolicy: {
        'img-src': ["'self'", 'data:', 'https:', 'http://localhost:3001'],
        'script-src': ["'self'", "'unsafe-inline'"],
      }
    },
    rateLimiter: {
      tokensPerInterval: 150,
      interval: 60000,
    }
  },

  // Pinia конфигурация
  pinia: {
    storesDirs: ['./stores/**'],
  },

  app: {
    head: {
      title: 'SnapBoard - Visual Inspiration Board',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Create and organize your visual inspiration boards' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001/api'
    }
  },

  // Proxy API requests to backend
  nitro: {
    routeRules: {
      '/api/**': { proxy: 'http://backend:3001/api/**' },
      '/uploads/**': { proxy: 'http://backend:3001/uploads/**' }
    }
  },

  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://backend:3001',
          changeOrigin: true
        },
        '/uploads': {
          target: 'http://backend:3001',
          changeOrigin: true
        }
      }
    }
  },
})
