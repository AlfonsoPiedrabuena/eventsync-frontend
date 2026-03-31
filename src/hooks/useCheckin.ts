import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { checkinApi } from '@/lib/api/checkin'

export const checkinKeys = {
  stats: (eventId: string) => ['checkin', 'stats', eventId] as const,
  search: (eventId: string, q: string) => ['checkin', 'search', eventId, q] as const,
}

export function useEventStats(eventId: string) {
  return useQuery({
    queryKey: checkinKeys.stats(eventId),
    queryFn: () => checkinApi.getStats(eventId),
    enabled: !!eventId,
    refetchInterval: 5000, // Poll every 5s for live counters
  })
}

export function useCheckinSearch(eventId: string, q: string) {
  return useQuery({
    queryKey: checkinKeys.search(eventId, q),
    queryFn: () => checkinApi.search(eventId, q),
    enabled: !!eventId && q.length >= 2,
  })
}

export function useCheckinByToken(eventId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (qr_token: string) => checkinApi.checkinByToken(qr_token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkinKeys.stats(eventId) })
    },
  })
}

export function useCheckinManual(eventId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (registration_id: string) => checkinApi.checkinManual(registration_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkinKeys.stats(eventId) })
    },
  })
}
