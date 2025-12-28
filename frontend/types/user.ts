export interface User {
    id: string
    email: string
    username: string
    avatar?: string
    createdAt: string
}

export interface AuthTokens {
    accessToken: string
    refreshToken: string
} 