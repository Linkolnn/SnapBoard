import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Конфигурация TypeORM для CLI (миграции)
 * Используется командами: migration:generate, migration:run, migration:revert
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'snapboard',
  password: process.env.DATABASE_PASSWORD || 'snapboard123',
  database: process.env.DATABASE_NAME || 'snapboard',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
