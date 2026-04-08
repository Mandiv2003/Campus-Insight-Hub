import api from './axiosInstance'

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    fullName: string
    role: 'USER' | 'ADMIN' | 'TECHNICIAN'
    avatarUrl: string | null
    username: string | null
  }
}

export const registerLocal = (data: {
  fullName: string
  email: string
  username?: string
  password: string
}) => api.post<{ success: boolean; data: AuthResponse }>('/auth/register', data)

export const loginLocal = (data: {
  identifier: string
  password: string
}) => api.post<{ success: boolean; data: AuthResponse }>('/auth/login', data)
