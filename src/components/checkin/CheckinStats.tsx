'use client'

import { Users, UserCheck, Clock, ListOrdered } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useEventStats } from '@/hooks/useCheckin'

interface CheckinStatsProps {
  eventId: string
}

export function CheckinStats({ eventId }: CheckinStatsProps) {
  const { data: stats } = useEventStats(eventId)

  const cards = [
    {
      label: 'Confirmados',
      value: stats?.confirmed ?? '—',
      icon: Users,
      className: 'text-blue-600',
    },
    {
      label: 'Check-in hecho',
      value: stats?.checked_in ?? '—',
      icon: UserCheck,
      className: 'text-green-600',
    },
    {
      label: 'Pendientes',
      value: stats?.pending ?? '—',
      icon: Clock,
      className: 'text-orange-500',
    },
    {
      label: 'Lista de espera',
      value: stats?.waitlisted ?? '—',
      icon: ListOrdered,
      className: 'text-muted-foreground',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, className }) => (
        <Card key={label}>
          <CardContent className="p-4 flex items-center gap-3">
            <Icon className={`h-8 w-8 shrink-0 ${className}`} />
            <div>
              <p className="text-2xl font-bold leading-none">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
