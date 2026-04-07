import { apiClient } from './client'
import type { Registration, RegistrationCreatePayload, RegistrationListResponse } from '@/types'

export const registrationsApi = {
  list: (params?: { event?: string; status?: string }) =>
    apiClient.get<RegistrationListResponse>('/registrations/', { params }).then(r => r.data),

  get: (id: string) =>
    apiClient.get<Registration>(`/registrations/${id}/`).then(r => r.data),

  register: (data: RegistrationCreatePayload) =>
    apiClient.post<Registration>('/registrations/', data).then(r => r.data),

  cancel: (id: string) =>
    apiClient.post<Registration>(`/registrations/${id}/cancel/`).then(r => r.data),

  cancelByToken: (token: string) =>
    apiClient.post<{ status: 'cancelled' | 'already_cancelled'; event_title?: string }>(
      '/registrations/cancel/',
      { token }
    ).then(r => r.data),

  exportCsvUrl: (eventId: string) =>
    `${process.env.NEXT_PUBLIC_API_URL}/api/registrations/?event=${eventId}&export=csv`,
}
