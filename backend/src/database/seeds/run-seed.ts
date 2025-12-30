import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { seed } from './seed';

// Загружаем переменные окружения
dotenv.config();

/**
 * Скрипт для запуска seed данных
 * Использование: npx ts-node src/database/seeds/run-seed.ts
 */
async function runSeed(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'snapboard',
    password: process.env.DATABASE_PASSWORD || 'snapboard123',
    database: process.env.DATABASE_NAME || 'snapboard',
    entities: ['src/**/*.entity.ts'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('📦 Database connected');

    await seed(dataSource);

    await dataSource.destroy();
    console.log('👋 Database connection closed');
  } catch (error) {
    console.error('❌ Error running seed:', error);
    process.exit(1);
  }
}

runSeed();
