import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { communicationsApi } from '@/lib/api/communications'
import type { ManualSendPayload } from '@/types'

const commKeys = {
  logs: (eventId: string) => ['communications', 'logs', eventId] as const,
}

export function useEmailLogs(eventId: string) {
  return useQuery({
    queryKey: commKeys.logs(eventId),
    queryFn: () => communicationsApi.getLogs(eventId).then(r => r.data),
    enabled: !!eventId,
  })
}

export function useSendManualEmail(eventId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ManualSendPayload) =>
      communicationsApi.sendManual(eventId, payload).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commKeys.logs(eventId) })
    },
  })
}
