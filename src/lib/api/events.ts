import { apiClient } from './client'
import type { Event, EventCreatePayload, EventStatus, PaginatedResponse } from '@/types'

export const eventsApi = {
  list: (params?: { status?: EventStatus; page?: number }) =>
    apiClient.get<PaginatedResponse<Event>>('/events/', { params }).then(r => r.data),

  get: (id: string) =>
    apiClient.get<Event>(`/events/${id}/`).then(r => r.data),

  create: (data: EventCreatePayload) =>
    apiClient.post<Event>('/events/', data).then(r => r.data),

  update: (id: string, data: Partial<EventCreatePayload>) =>
    apiClient.patch<Event>(`/events/${id}/`, data).then(r => r.data),

  delete: (id: string) =>
    apiClient.delete(`/events/${id}/`),

  transition: (id: string, status: EventStatus) =>
    apiClient.post<Event>(`/events/${id}/transition/`, { status }).then(r => r.data),
}
