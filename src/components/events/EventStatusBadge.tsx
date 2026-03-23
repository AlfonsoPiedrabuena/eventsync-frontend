import { Badge } from '@/components/ui/badge'
import type { EventStatus } from '@/types'

const STATUS_CONFIG: Record<EventStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft:     { label: 'Borrador',   variant: 'outline' },
  published: { label: 'Publicado',  variant: 'default' },
  closed:    { label: 'Cerrado',    variant: 'secondary' },
  cancelled: { label: 'Cancelado',  variant: 'destructive' },
  finalized: { label: 'Finalizado', variant: 'secondary' },
}

interface EventStatusBadgeProps {
  status: EventStatus
  className?: string
}

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const { label, variant } = STATUS_CONFIG[status] ?? { label: status, variant: 'outline' }
  return <Badge variant={variant} className={className}>{label}</Badge>
}
