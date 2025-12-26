interface User {
    id: string
    email: string
    username: string
    avatar?: string
    createAt: string
}

export interface AuthTokens {
    accessToken: string
    refreshToken: string
} 