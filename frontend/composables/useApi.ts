/**
 * Composable для работы с Backend API
 * Централизованная обработка запросов с автоматическим refresh токенов
 */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface ApiOptions {
  method?: HttpMethod
  body?: string
  headers?: Record<string, string>
  skipAuth?: boolean
}

export const useApi = () => {
  // Всегда используем /api prefix - proxy в dev, прямой URL в prod
  const apiBase = '/api'

  /**
   * Базовый fetch с обработкой ошибок и refresh токенов
   */
  const apiFetch = async <T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> => {
    const { skipAuth, ...fetchOptions } = options
    // Endpoint уже должен начинаться с /, добавляем /api prefix
    const url = apiBase + endpoint

    try {
      const response = await $fetch<T>(url, {
        credentials: 'include',
        method: fetchOptions.method,
        body: fetchOptions.body,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      })
      return response
    } catch (error: any) {
      // Если 401 и не skipAuth - пробуем refresh
      if (error.statusCode === 401 && !skipAuth) {
        try {
          await $fetch(apiBase + '/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          })
          // Повторяем оригинальный запрос
          return await $fetch<T>(url, {
            credentials: 'include',
            method: fetchOptions.method,
            body: fetchOptions.body,
          })
        } catch {
          // Refresh не удался - выбрасываем оригинальную ошибку
          throw error
        }
      }
      throw error
    }
  }

  // Shorthand методы
  const get = <T>(endpoint: string, options?: ApiOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' })

  const post = <T>(endpoint: string, body?: any, options?: ApiOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) })

  const put = <T>(endpoint: string, body?: any, options?: ApiOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) })

  const del = <T>(endpoint: string, body?: any, options?: ApiOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE', body: body ? JSON.stringify(body) : undefined })

  /**
   * Upload файла через FormData
   */
  const upload = async <T>(
    endpoint: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> => {
    const url = apiBase + endpoint
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText))
          } catch {
            resolve(xhr.responseText as T)
          }
        } else {
          try {
            reject(JSON.parse(xhr.responseText))
          } catch {
            reject(new Error(xhr.statusText))
          }
        }
      })

      xhr.addEventListener('error', () => reject(new Error('Network error')))
      xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))

      xhr.open('POST', url)
      xhr.withCredentials = true
      xhr.send(formData)
    })
  }

  return {
    apiFetch,
    get,
    post,
    put,
    del,
    upload,
    apiBase
  }
}
