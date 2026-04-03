import { apiClient } from './client'
import type { EventSummary, RegistrationsTimeline, TenantDashboard } from '@/types'

export const analyticsApi = {
  dashboard: () =>
    apiClient.get<TenantDashboard>('/analytics/dashboard/'),

  eventSummary: (eventId: string) =>
    apiClient.get<EventSummary>(`/analytics/events/${eventId}/summary/`),

  eventTimeline: (eventId: string) =>
    apiClient.get<RegistrationsTimeline>(`/analytics/events/${eventId}/timeline/`),
}
