export interface Image {
  id: string
  url: string
  title?: string
  description?: string
  boardId: string
  userId: string
  tags?: string[]
  createdAt: string
}