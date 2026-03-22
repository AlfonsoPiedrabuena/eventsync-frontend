import { apiClient } from './client'
import { User } from '@/types'

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  organization_name: string
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirm: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface PasswordResetData {
  email: string
}

export interface PasswordResetConfirmData {
  token: string
  password: string
  password_confirm: string
}

export interface AcceptInvitationData {
  token: string
  first_name: string
  last_name: string
  password: string
  password_confirm: string
}

export const authApi = {
  register: (data: RegisterData) =>
    apiClient.post<{ message: string; tenant_schema: string }>('/auth/register/', data),

  login: (data: LoginData) =>
    apiClient.post<AuthTokens & { user: User }>('/auth/login/', data),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout/', { refresh: refreshToken }),

  me: () =>
    apiClient.get<User>('/auth/me/'),

  verifyEmail: (token: string) =>
    apiClient.get(`/auth/verify-email/${token}/`),

  requestPasswordReset: (data: PasswordResetData) =>
    apiClient.post('/auth/password-reset/', data),

  confirmPasswordReset: (data: PasswordResetConfirmData) =>
    apiClient.post('/auth/password-reset/confirm/', data),

  acceptInvitation: (data: AcceptInvitationData) =>
    apiClient.post('/auth/invitations/accept/', data),

  refreshToken: (refresh: string) =>
    apiClient.post<{ access: string }>('/auth/token/refresh/', { refresh }),
}
