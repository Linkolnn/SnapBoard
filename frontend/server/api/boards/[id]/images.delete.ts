/**
 * DELETE /api/boards/:id/images
 * Удаление изображения с доски
 */
export default defineEventHandler(async (event) => {
  const boardId = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  if (!boardId) {
    throw createError({
      statusCode: 400,
      message: 'ID доски обязателен'
    })
  }

  if (!body.imageId) {
    throw createError({
      statusCode: 400,
      message: 'ID изображения обязателен'
    })
  }

  // TODO: Проверка авторизации
  // TODO: Проверка существования связи
  // TODO: Удаление из БД

  // Mock response
  await new Promise(resolve => setTimeout(resolve, 300))

  return {
    success: true,
    message: 'Изображение удалено с доски',
    data: {
      boardId,
      imageId: body.imageId
    }
  }
})
