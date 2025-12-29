import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  // TODO: Check authentication and get real user images
  
  // Mock images
  const images = Array.from({ length: 12 }, (_, i) => ({
    id: `user-img-${i + 1}`,
    url: `https://picsum.photos/seed/user${i + 1}/${400 + (i % 3) * 100}/${300 + (i % 4) * 50}`,
    title: `Моё изображение ${i + 1}`,
    description: i % 2 === 0 ? 'Описание изображения' : null,
    width: 400 + (i % 3) * 100,
    height: 300 + (i % 4) * 50,
    tags: ['личное', 'фото'],
    authorId: '1',
    authorName: 'User',
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    likesCount: Math.floor(Math.random() * 50),
    viewsCount: Math.floor(Math.random() * 200)
  }))
  
  return { images }
})
