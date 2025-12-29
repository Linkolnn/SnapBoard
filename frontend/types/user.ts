export interface User {
    id: string
    email: string
    username: string
    name?: string
    bio?: string
    avatar?: string
    createdAt: string
    updatedAt?: string
}

export interface UserStats {
    boardsCount: number
    imagesCount: number
    favoritesCount: number
    joinedAt: string
}

export interface UpdateProfileDto {
    name?: string
    bio?: string
}

export interface ChangePasswordDto {
    currentPassword: string
    newPassword: string
}

export interface AuthTokens {
    accessToken: string
    refreshToken: string
} 