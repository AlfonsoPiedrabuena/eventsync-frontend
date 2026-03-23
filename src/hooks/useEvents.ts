import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api/events'
import type { EventStatus, EventCreatePayload } from '@/types'

export const eventKeys = {
  all: ['events'] as const,
  list: (filters?: { status?: EventStatus }) => [...eventKeys.all, 'list', filters] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
}

export function useEvents(filters?: { status?: EventStatus }) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => eventsApi.list(filters),
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: EventCreatePayload) => eventsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all })
    },
  })
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<EventCreatePayload>) => eventsApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(eventKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: eventKeys.list() })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all })
    },
  })
}

export function useTransitionEvent(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: EventStatus) => eventsApi.transition(id, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(eventKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: eventKeys.list() })
    },
  })
}
