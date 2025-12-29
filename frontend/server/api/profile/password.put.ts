import { defineEventHandler, readBody, createError } from 'h3'
import type { ChangePasswordDto } from '~/types/user'

export default defineEventHandler(async (event) => {
  // TODO: Check authentication
  
  const body = await readBody<ChangePasswordDto>(event)
  
  // Validation
  if (!body.currentPassword) {
    throw createError({
      statusCode: 400,
      message: 'Введите текущий пароль'
    })
  }
  
  if (!body.newPassword) {
    throw createError({
      statusCode: 400,
      message: 'Введите новый пароль'
    })
  }
  
  if (body.newPassword.length < 8) {
    throw createError({
      statusCode: 400,
      message: 'Новый пароль должен содержать минимум 8 символов'
    })
  }
  
  // Mock: Verify current password
  // In real implementation, check against stored hash
  if (body.currentPassword === 'wrong') {
    throw createError({
      statusCode: 401,
      message: 'Неверный текущий пароль'
    })
  }
  
  return {
    success: true,
    message: 'Пароль успешно изменён'
  }
})
