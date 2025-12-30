/**
 * Конфигурация загрузки файлов
 */
export const uploadConfig = {
  // Максимальный размер файла (10MB)
  maxFileSize: 10 * 1024 * 1024,

  // Максимальное количество файлов за раз
  maxFiles: 10,

  // Разрешённые MIME типы
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ],

  // Разрешённые расширения
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],

  // Размеры thumbnails
  thumbnailSizes: {
    small: { width: 150, height: 150 },
    medium: { width: 400, height: 400 },
    large: { width: 800, height: 800 },
  },

  // Максимальный размер оригинала (ресайз если больше)
  maxImageDimension: 2560,

  // Качество JPEG/WebP (1-100)
  quality: 85,

  // Папки для хранения
  paths: {
    images: './uploads/images',
    thumbnails: './uploads/thumbnails',
  },
};

/**
 * Получение конфигурации из переменных окружения
 */
export const getUploadConfig = () => ({
  ...uploadConfig,
  maxFileSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10),
  quality: parseInt(process.env.UPLOAD_QUALITY || '85', 10),
});
