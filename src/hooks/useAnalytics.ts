import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api/analytics'

export function useTenantDashboard() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsApi.dashboard().then(r => r.data),
    staleTime: 30_000,
  })
}

export function useEventSummary(eventId: string) {
  return useQuery({
    queryKey: ['analytics', 'event-summary', eventId],
    queryFn: () => analyticsApi.eventSummary(eventId).then(r => r.data),
    staleTime: 30_000,
  })
}

export function useEventTimeline(eventId: string) {
  return useQuery({
    queryKey: ['analytics', 'event-timeline', eventId],
    queryFn: () => analyticsApi.eventTimeline(eventId).then(r => r.data),
    staleTime: 30_000,
  })
}
