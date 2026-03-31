import { apiClient } from './client'
import type { CheckinResponse, EventStats, RegistrationListResponse } from '@/types'

export const checkinApi = {
  checkinByToken: (qr_token: string) =>
    apiClient.post<CheckinResponse>('/checkin/', { qr_token }).then(r => r.data),

  checkinManual: (registration_id: string) =>
    apiClient.post<CheckinResponse>('/checkin/manual/', { registration_id }).then(r => r.data),

  getStats: (eventId: string) =>
    apiClient.get<EventStats>('/checkin/stats/', { params: { event: eventId } }).then(r => r.data),

  search: (eventId: string, q: string) =>
    apiClient
      .get<RegistrationListResponse>('/checkin/search/', { params: { event: eventId, q } })
      .then(r => r.data),
}
