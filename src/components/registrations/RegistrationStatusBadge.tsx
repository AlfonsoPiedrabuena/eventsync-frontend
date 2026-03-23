import { Badge } from '@/components/ui/badge'
import type { RegistrationStatus } from '@/types'

const config: Record<RegistrationStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  confirmed:  { label: 'Confirmado',       variant: 'default' },
  waitlisted: { label: 'Lista de espera',  variant: 'secondary' },
  cancelled:  { label: 'Cancelado',        variant: 'destructive' },
}

export function RegistrationStatusBadge({ status }: { status: RegistrationStatus }) {
  const { label, variant } = config[status] ?? { label: status, variant: 'outline' }
  return <Badge variant={variant}>{label}</Badge>
}
