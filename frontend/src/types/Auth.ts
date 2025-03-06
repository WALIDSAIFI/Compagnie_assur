export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  roles?: string[]
}

export interface AuthResponse {
  token: string
  type: string
  id: number
  username: string
  email: string
  roles: string[]
}

export interface User {
  id: number
  username: string
  email: string
  roles: string[]
}

