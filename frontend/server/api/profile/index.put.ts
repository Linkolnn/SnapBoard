import { defineEventHandler, readBody, createError } from 'h3'
import type { UpdateProfileDto } from '~/types/user'

export default defineEventHandler(async (event) => {
  // TODO: Check authentication
  
  const body = await readBody<UpdateProfileDto>(event)
  
  // Validation
  if (body.name !== undefined) {
    const name = body.name.trim()
    if (name.length < 2) {
      throw createError({
        statusCode: 400,
        message: 'Имя должно содержать минимум 2 символа'
      })
    }
    if (name.length > 50) {
      throw createError({
        statusCode: 400,
        message: 'Имя не должно превышать 50 символов'
      })
    }
  }
  
  if (body.bio !== undefined && body.bio.length > 200) {
    throw createError({
      statusCode: 400,
      message: 'Описание не должно превышать 200 символов'
    })
  }
  
  // Mock: Return updated profile
  return {
    success: true,
    user: {
      id: '1',
      email: 'user@example.com',
      username: 'user',
      name: body.name?.trim() || 'User',
      bio: body.bio?.trim() || null,
      avatar: null,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    }
  }
})
