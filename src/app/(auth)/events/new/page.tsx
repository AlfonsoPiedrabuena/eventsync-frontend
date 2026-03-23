'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EventForm } from '@/components/events/EventForm'
import { useCreateEvent } from '@/hooks/useEvents'
import { toast } from 'sonner'
import type { EventCreatePayload } from '@/types'

export default function NewEventPage() {
  const router = useRouter()
  const { mutateAsync, isPending, error } = useCreateEvent()

  const handleSubmit = async (data: EventCreatePayload) => {
    const event = await mutateAsync(data)
    toast.success('Evento creado correctamente')
    router.push(`/events/${event.id}`)
  }

  const errorMessage = error
    ? (error as any)?.response?.data?.error?.join(', ') ?? 'Error al crear el evento'
    : null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/events">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nuevo evento</h1>
          <p className="text-muted-foreground text-sm">
            Se creará en estado Borrador. Podrás publicarlo cuando esté listo.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del evento</CardTitle>
          <CardDescription>
            Completa los datos básicos. Podrás editar todo antes de publicar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventForm
            onSubmit={handleSubmit}
            isLoading={isPending}
            error={errorMessage}
            submitLabel="Crear evento"
          />
        </CardContent>
      </Card>
    </div>
  )
}
