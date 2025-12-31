export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'snapboard',
    password: process.env.DATABASE_PASSWORD || 'snapboard123',
    name: process.env.DATABASE_NAME || 'snapboard',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    accessExpiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES_IN || '900', 10),
    refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800', 10),
  },

  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    allowedMimeTypes: (
      process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp,image/gif'
    ).split(','),
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // Mail Configuration (SMTP)
  mail: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'SnapBoard <noreply@snapboard.com>',
  },

  // Rate Limiting Configuration
  rateLimit: {
    // Общий лимит для всех запросов
    general: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 минут
      max: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10), // 1000 запросов
    },
    // Лимит для auth endpoints (защита от брутфорса)
    auth: {
      windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW || '3600000', 10), // 1 час
      max: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '10', 10), // 10 попыток
    },
    // Лимит для upload endpoints (защита от спама)
    upload: {
      windowMs: parseInt(process.env.RATE_LIMIT_UPLOAD_WINDOW || '3600000', 10), // 1 час
      max: parseInt(process.env.RATE_LIMIT_UPLOAD_MAX || '50', 10), // 50 загрузок
    },
  },
});
