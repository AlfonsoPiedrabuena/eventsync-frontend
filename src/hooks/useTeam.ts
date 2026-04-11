import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth'
import { TeamMember } from '@/types'

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team'],
    queryFn: () => authApi.teamList().then(r => r.data.results),
  })
}

export function useUpdateTeamMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string
      data: { role?: TeamMember['role']; is_active?: boolean }
    }) => authApi.teamUpdate(userId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team'] }),
  })
}

export function useDeactivateTeamMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => authApi.teamDeactivate(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team'] }),
  })
}
