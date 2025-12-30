import { ref } from 'vue'
import type { Image } from '~/types/image'

interface RecommendedImage extends Image {
  score: number
  matchedTags: string[]
}

interface SourceImage {
  id: string
  title: string | null
  tags: string[]
}

interface RecommendationsResponse {
  items: RecommendedImage[]
  sourceImage: SourceImage
  totalMatches: number
}

/**
 * Composable для работы с рекомендациями изображений
 */
export const useRecommendations = () => {
  const recommendations = ref<RecommendedImage[]>([])
  const isLoading = ref(false)
  const sourceImage = ref<SourceImage | null>(null)
  const totalMatches = ref(0)
  const error = ref<string | null>(null)

  /**
   * Загрузка рекомендаций из API
   */
  const loadRecommendations = async (imageId: string, limit = 12): Promise<RecommendationsResponse | null> => {
    if (!imageId) {
      recommendations.value = []
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<RecommendationsResponse>(
        `/api/images/${imageId}/recommendations`,
        {
          query: { limit },
        }
      )

      if (response) {
        recommendations.value = response.items || []
        sourceImage.value = response.sourceImage
        totalMatches.value = response.totalMatches
      }

      return response
    } catch (err: any) {
      console.error('Failed to load recommendations:', err)
      error.value = err.message || 'Ошибка загрузки рекомендаций'
      recommendations.value = []
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Очистка рекомендаций
   */
  const clearRecommendations = () => {
    recommendations.value = []
    sourceImage.value = null
    totalMatches.value = 0
    error.value = null
  }

  return {
    recommendations,
    isLoading,
    sourceImage,
    totalMatches,
    error,
    loadRecommendations,
    clearRecommendations,
  }
}
