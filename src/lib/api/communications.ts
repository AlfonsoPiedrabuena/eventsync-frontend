import { apiClient } from './client'
import type { EmailLog, ManualSendPayload, PaginatedResponse } from '@/types'

export const communicationsApi = {
  getLogs: (eventId: string) =>
    apiClient.get<EmailLog[]>(`/communications/events/${eventId}/logs/`),

  sendManual: (eventId: string, payload: ManualSendPayload) =>
    apiClient.post<{ detail: string }>(`/communications/events/${eventId}/send/`, payload),
}
