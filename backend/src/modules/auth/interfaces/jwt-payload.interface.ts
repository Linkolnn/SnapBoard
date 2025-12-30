/**
 * Структура данных внутри JWT токена (payload)
 */
export interface JwtPayload {
  sub: string;      // User ID (subject)
  email: string;    // Email пользователя
  username: string; // Username пользователя
}

/**
 * Расширенный payload с метаданными токена
 */
export interface JwtPayloadWithTimestamps extends JwtPayload {
  iat: number;  // Issued At (Unix timestamp)
  exp: number;  // Expiration (Unix timestamp)
}
