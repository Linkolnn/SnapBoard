import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';
import { Board } from '../../modules/boards/entities/board.entity';

/**
 * Seed данные для разработки
 * Создаёт тестовых пользователей и доски
 *
 * Запуск: npx ts-node src/database/seeds/run-seed.ts
 */
export async function seed(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const boardRepository = dataSource.getRepository(Board);

  // Проверяем, есть ли уже данные
  const existingUser = await userRepository.findOne({
    where: { email: 'test@example.com' },
  });

  if (existingUser) {
    console.log('⚠️ Seed data already exists, skipping...');
    return;
  }

  // Создаём тестового пользователя
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = userRepository.create({
    email: 'test@example.com',
    username: 'testuser',
    passwordHash,
    name: 'Test User',
    bio: 'This is a test user for development',
  });

  await userRepository.save(user);
  console.log('✅ Created test user:', user.email);

  // Создаём тестовые доски
  const boardsData = [
    {
      title: 'Design Inspiration',
      description: 'UI/UX design ideas and inspiration',
      isPrivate: false,
    },
    {
      title: 'Travel Photos',
      description: 'Beautiful places to visit around the world',
      isPrivate: false,
    },
    {
      title: 'Private Collection',
      description: 'My private images collection',
      isPrivate: true,
    },
  ];

  for (const boardData of boardsData) {
    const board = boardRepository.create({
      ...boardData,
      userId: user.id,
    });
    await boardRepository.save(board);
    console.log('✅ Created board:', board.title);
  }

  console.log('🎉 Seed completed successfully!');
}
