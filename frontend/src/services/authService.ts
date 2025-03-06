import api from "./api"
import type { LoginRequest, RegisterRequest, AuthResponse } from "../types/Auth"

const AUTH_URL = "/auth"

const login = async (loginRequest: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(`${AUTH_URL}/signin`, loginRequest)
  if (response.data.token) {
    localStorage.setItem("token", response.data.token)
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        roles: response.data.roles,
      }),
    )
  }
  return response.data
}

const register = async (registerRequest: RegisterRequest): Promise<any> => {
  return api.post(`${AUTH_URL}/signup`, registerRequest)
}

const logout = (): void => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

const getCurrentUser = (): any => {
  const userStr = localStorage.getItem("user")
  if (userStr) return JSON.parse(userStr)
  return null
}

const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token")
}

const hasRole = (role: string): boolean => {
  const user = getCurrentUser()
  if (!user) return false
  return user.roles.includes(role)
}

const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated,
  hasRole,
}

export default authService

