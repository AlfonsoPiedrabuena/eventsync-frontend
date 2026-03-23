'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2, ChevronRight, Users } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { EventStatusBadge } from '@/components/events/EventStatusBadge'
import { EventForm } from '@/components/events/EventForm'
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { useEvent, useUpdateEvent, useDeleteEvent, useTransitionEvent } from '@/hooks/useEvents'
import { toast } from 'sonner'
import type { EventCreatePayload, EventStatus } from '@/types'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [isEditing, setIsEditing] = useState(false)

  const { data: event, isLoading, isError } = useEvent(id)
  const updateEvent = useUpdateEvent(id)
  const deleteEvent = useDeleteEvent()
  const transitionEvent = useTransitionEvent(id)

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-64 rounded-lg border bg-muted animate-pulse" />
      </div>
    )
  }

  if (isError || !event) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Evento no encontrado.</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/events">Volver a eventos</Link>
        </Button>
      </div>
    )
  }

  const handleUpdate = async (data: EventCreatePayload) => {
    await updateEvent.mutateAsync(data)
    toast.success('Evento actualizado')
    setIsEditing(false)
  }

  const handleTransition = async (status: EventStatus) => {
    await transitionEvent.mutateAsync(status)
    toast.success(`Evento ${status === 'published' ? 'publicado' : 'actualizado'} correctamente`)
  }

  const handleDelete = async () => {
    await deleteEvent.mutateAsync(id)
    toast.success('Evento eliminado')
    router.push('/events')
  }

  const updateError = updateEvent.error
    ? (updateEvent.error as any)?.response?.data?.error?.join(', ') ?? 'Error al actualizar'
    : null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/events">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Eventos
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{event.title}</h1>
              <EventStatusBadge status={event.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              Creado el {format(new Date(event.created_at), "d MMM yyyy", { locale: es })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {event.status === 'draft' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Eliminar evento</DialogTitle>
                  <DialogDescription>
                    ¿Seguro que deseas eliminar "{event.title}"? Esta acción no se puede deshacer.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={handleDelete} disabled={deleteEvent.isPending}>
                    {deleteEvent.isPending ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {!isEditing && event.status !== 'cancelled' && event.status !== 'finalized' && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
          )}

          {/* Status transitions */}
          {event.valid_transitions.map(({ value, label }) => (
            <Button
              key={value}
              size="sm"
              variant={value === 'cancelled' ? 'destructive' : 'default'}
              onClick={() => handleTransition(value as EventStatus)}
              disabled={transitionEvent.isPending}
            >
              {transitionEvent.isPending ? 'Procesando...' : label}
              {!transitionEvent.isPending && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          ))}
        </div>
      </div>

      {/* Edit form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Editar evento</CardTitle>
            <CardDescription>Los cambios se guardan en estado {event.status === 'draft' ? 'Borrador' : 'Publicado'}.</CardDescription>
          </CardHeader>
          <CardContent>
            <EventForm
              defaultValues={event}
              onSubmit={handleUpdate}
              isLoading={updateEvent.isPending}
              error={updateError}
              submitLabel="Guardar cambios"
            />
            <Button variant="ghost" className="mt-3 w-full" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Detail view */}
      {!isEditing && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {event.description && (
                <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
              )}
              <Separator />
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                <dt className="text-muted-foreground">Inicio</dt>
                <dd>{format(new Date(event.start_date), "d MMM yyyy · HH:mm", { locale: es })}</dd>
                <dt className="text-muted-foreground">Fin</dt>
                <dd>{format(new Date(event.end_date), "d MMM yyyy · HH:mm", { locale: es })}</dd>
                <dt className="text-muted-foreground">Modalidad</dt>
                <dd>{event.is_virtual ? 'Virtual' : 'Presencial'}</dd>
                {!event.is_virtual && event.location && (
                  <>
                    <dt className="text-muted-foreground">Ubicación</dt>
                    <dd>{event.location}</dd>
                  </>
                )}
                {event.is_virtual && event.location_url && (
                  <>
                    <dt className="text-muted-foreground">URL</dt>
                    <dd>
                      <a href={event.location_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                        Enlace del evento
                      </a>
                    </dd>
                  </>
                )}
                <dt className="text-muted-foreground">Organizador</dt>
                <dd>{event.organizer_name}</dd>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Registros</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/events/${id}/registrations`}>
                  <Users className="h-4 w-4 mr-1" />
                  Ver todos
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="text-3xl font-bold">{event.registration_count}</div>
              <p className="text-muted-foreground">registros confirmados</p>
              {event.max_capacity !== null && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacidad</span>
                    <span>{event.max_capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Disponibles</span>
                    <span>{event.spots_remaining}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(100, (event.registration_count / event.max_capacity) * 100)}%` }}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
