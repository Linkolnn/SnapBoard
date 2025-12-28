export interface Board {
  id: string
  title: string
  description?: string
  userId: string
  coverImage?: string
  isPrivate: boolean
  imageCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateBoardDto {
  title: string
  description?: string
  isPrivate?: boolean
}

export interface UpdateBoardDto {
  title?: string
  description?: string
  isPrivate?: boolean
}
