import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  // TODO: Check authentication and get real user boards
  
  // Mock boards
  return {
    boards: [
      {
        id: '1',
        name: 'Вдохновение',
        description: 'Коллекция вдохновляющих изображений',
        coverImage: 'https://picsum.photos/seed/board1/400/300',
        imageCount: 12,
        isPrivate: false,
        createdAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-25T15:30:00Z'
      },
      {
        id: '2',
        name: 'Дизайн интерьера',
        description: 'Идеи для дома',
        coverImage: 'https://picsum.photos/seed/board2/400/300',
        imageCount: 8,
        isPrivate: false,
        createdAt: '2025-01-18T14:00:00Z',
        updatedAt: '2025-01-24T09:15:00Z'
      },
      {
        id: '3',
        name: 'Путешествия',
        description: 'Места, которые хочу посетить',
        coverImage: 'https://picsum.photos/seed/board3/400/300',
        imageCount: 15,
        isPrivate: true,
        createdAt: '2025-01-10T08:00:00Z',
        updatedAt: '2025-01-23T18:45:00Z'
      }
    ]
  }
})
