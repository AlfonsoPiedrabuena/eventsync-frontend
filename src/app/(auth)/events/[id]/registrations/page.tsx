'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, Download, X, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RegistrationStatusBadge } from '@/components/registrations/RegistrationStatusBadge'
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { useEvent } from '@/hooks/useEvents'
import { useRegistrations, useCancelRegistration } from '@/hooks/useRegistrations'
import { registrationsApi } from '@/lib/api/registrations'
import { toast } from 'sonner'
import type { Registration, RegistrationStatus } from '@/types'

const STATUS_FILTERS: { label: string; value: RegistrationStatus | undefined }[] = [
  { label: 'Todos', value: undefined },
  { label: 'Confirmados', value: 'confirmed' },
  { label: 'Lista de espera', value: 'waitlisted' },
  { label: 'Cancelados', value: 'cancelled' },
]

export default function EventRegistrationsPage() {
  const params = useParams()
  const eventId = params.id as string
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | undefined>(undefined)

  const { data: event } = useEvent(eventId)
  const { data, isLoading } = useRegistrations(eventId, statusFilter)
  const cancelMutation = useCancelRegistration(eventId)

  const handleCancel = async (reg: Registration) => {
    await cancelMutation.mutateAsync(reg.id)
    toast.success(`Registro de ${reg.full_name} cancelado`)
  }

  const handleExport = () => {
    const url = registrationsApi.exportCsvUrl(eventId)
    // Open in new tab — browser handles the download with auth cookie
    window.open(url, '_blank')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/events/${eventId}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {event?.title ?? 'Evento'}
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            Registros
            {data && (
              <Badge variant="secondary" className="text-sm font-normal">
                {data.count}
              </Badge>
            )}
          </h1>
        </div>

        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" />
          Exportar CSV
        </Button>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <Button
            key={String(f.value)}
            variant={statusFilter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-muted-foreground font-normal">
            {isLoading ? 'Cargando...' : `${data?.count ?? 0} registros`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : !data?.results.length ? (
            <div className="text-center py-16 text-muted-foreground">
              No hay registros{statusFilter ? ' con este estado' : ' aún'}.
            </div>
          ) : (
            <div className="divide-y">
              {data.results.map(reg => (
                <RegistrationRow
                  key={reg.id}
                  registration={reg}
                  onCancel={handleCancel}
                  isCancelling={cancelMutation.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function RegistrationRow({
  registration: reg,
  onCancel,
  isCancelling,
}: {
  registration: Registration
  onCancel: (reg: Registration) => Promise<void>
  isCancelling: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-muted/40 transition-colors">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{reg.full_name}</p>
          <RegistrationStatusBadge status={reg.status} />
          {reg.checked_in && (
            <Badge variant="outline" className="text-xs text-green-600 border-green-300">
              Check-in ✓
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{reg.email}</p>
        {reg.company && (
          <p className="text-xs text-muted-foreground">{reg.company}{reg.position ? ` · ${reg.position}` : ''}</p>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-4">
        <p className="text-xs text-muted-foreground hidden sm:block">
          {format(new Date(reg.created_at), "d MMM yyyy", { locale: es })}
        </p>

        {reg.status !== 'cancelled' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <X className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancelar registro</DialogTitle>
                <DialogDescription>
                  ¿Cancelar el registro de <strong>{reg.full_name}</strong>?
                  {reg.status === 'confirmed' && ' Si hay asistentes en lista de espera, el primero será promovido automáticamente.'}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Volver</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  disabled={isCancelling}
                  onClick={() => onCancel(reg)}
                >
                  {isCancelling ? 'Cancelando...' : 'Cancelar registro'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
