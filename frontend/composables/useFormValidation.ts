import { ref, computed } from 'vue';

interface ValidationRule {
    validator: (value: string) => boolean
    message: string
};

interface FormField {
    value: string
    error: string
    touched: boolean
};

export const useFormValidation = (rules: Record<string, ValidationRule[]>) => {
  /**
   * Объект с полями формы
   * Каждое поле содержит: value (значение), error (ошибка), touched (изменялось ли)
   */
  const fields = ref<Record<string, FormField>>(
    Object.keys(rules).reduce((acc, fieldName) => {
      acc[fieldName] = {
        value: '',
        error: '',
        touched: false
      }
      return acc
    }, {} as Record<string, FormField>)
  )
  
  /**
   * Валидация одного поля
   * Проходит по всем правилам для поля и находит первую ошибку
   * 
   * @param fieldName - имя поля для валидации
   * @returns true если валидация прошла, false если есть ошибки
   */
  const validateField = (fieldName: string): boolean => {
    const field = fields.value[fieldName]
    const fieldRules = rules[fieldName]
    
    // Очищаем предыдущую ошибку
    field.error = ''
    
    // Проверяем каждое правило
    for (const rule of fieldRules) {
      if (!rule.validator(field.value)) {
        field.error = rule.message
        return false
      }
    }
    
    return true
  }
  
  /**
   * Валидация всей формы
   * Проверяет все поля и возвращает результат
   * 
   * @returns true если вся форма валидна, false если есть ошибки
   */
  const validate = (): boolean => {
    let isValid = true
    
    // Валидируем каждое поле
    for (const fieldName in fields.value) {
      const fieldValid = validateField(fieldName)
      if (!fieldValid) {
        isValid = false
      }
    }
    
    return isValid
  }
  
  /**
   * Обработчик изменения поля
   * Вызывается при вводе текста в поле
   * 
   * @param fieldName - имя поля
   * @param value - новое значение
   */
  const handleInput = (fieldName: string, value: string) => {
    fields.value[fieldName].value = value
    fields.value[fieldName].touched = true
    
    // Валидируем поле только если оно уже было изменено
    if (fields.value[fieldName].touched) {
      validateField(fieldName)
    }
  }
  
  /**
   * Обработчик потери фокуса поля
   * Валидирует поле когда пользователь уходит с него
   * 
   * @param fieldName - имя поля
   */
  const handleBlur = (fieldName: string) => {
    fields.value[fieldName].touched = true
    validateField(fieldName)
  }
  
  /**
   * Сброс формы в начальное состояние
   * Очищает все значения и ошибки
   */
  const resetForm = () => {
    for (const fieldName in fields.value) {
      fields.value[fieldName].value = ''
      fields.value[fieldName].error = ''
      fields.value[fieldName].touched = false
    }
  }
  
  /**
   * Computed: форма валидна и готова к отправке
   * Проверяет что все поля заполнены и нет ошибок
   */
  const isFormValid = computed(() => {
    return Object.values(fields.value).every(
      field => field.value && !field.error
    )
  })
  
  return {
    fields,
    validate,
    validateField,
    handleInput,
    handleBlur,
    resetForm,
    isFormValid
  }
}

export const requiredRule: ValidationRule = {
  validator: (value: string) => value.trim().length > 0,
  message: 'Это поле обязательно для заполнения'
}

/**
 * Правило: валидация email
 */
export const emailRule: ValidationRule = {
  validator: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },
  message: 'Введите корректный email адрес'
}

/**
 * Правило: минимальная длина строки
 * @param minLength - минимальное количество символов
 */
export const minLengthRule = (minLength: number): ValidationRule => ({
  validator: (value: string) => value.length >= minLength,
  message: `Минимальная длина ${minLength} символов`
})

/**
 * Правило: максимальная длина строки
 * @param maxLength - максимальное количество символов
 */
export const maxLengthRule = (maxLength: number): ValidationRule => ({
  validator: (value: string) => value.length <= maxLength,
  message: `Максимальная длина ${maxLength} символов`
})

/**
 * Правило: пароли должны совпадать
 * @param getPasswordValue - функция для получения значения пароля для сравнения
 */
export const passwordMatchRule = (getPasswordValue: () => string): ValidationRule => ({
  validator: (value: string) => value === getPasswordValue(),
  message: 'Пароли не совпадают'
})
