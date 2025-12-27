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
        'img-src': ["'self'", 'data:', 'https:'],
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
    storesDirs: ['./stores/**'], // путь к stores
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

    // ... остальная конфигурация
  
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3001/api'
    }
  },
  
  // Настройки для работы с cookies
  nitro: {
    experimental: {
      // Включаем поддержку cookies в SSR
      payloadExtraction: false
    }
  },
})
