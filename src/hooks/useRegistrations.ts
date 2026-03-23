import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { registrationsApi } from '@/lib/api/registrations'
import type { RegistrationCreatePayload, RegistrationStatus } from '@/types'

export const registrationKeys = {
  all: ['registrations'] as const,
  list: (eventId: string, status?: RegistrationStatus) =>
    [...registrationKeys.all, 'list', eventId, status] as const,
  detail: (id: string) => [...registrationKeys.all, 'detail', id] as const,
}

export function useRegistrations(eventId: string, status?: RegistrationStatus) {
  return useQuery({
    queryKey: registrationKeys.list(eventId, status),
    queryFn: () => registrationsApi.list({ event: eventId, status }),
    enabled: !!eventId,
  })
}

export function useRegisterForEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RegistrationCreatePayload) => registrationsApi.register(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: registrationKeys.list(variables.event_id),
      })
    },
  })
}

export function useCancelRegistration(eventId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => registrationsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.list(eventId) })
    },
  })
}
