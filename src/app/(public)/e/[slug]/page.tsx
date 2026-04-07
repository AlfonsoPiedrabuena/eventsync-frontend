'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, MapPin, Globe, Users, CheckCircle } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { apiClient } from '@/lib/api/client'
import { registrationsApi } from '@/lib/api/registrations'
import type { Event } from '@/types'

// ---------- Schema ----------
const registrationSchema = z.object({
  first_name: z.string().min(1, 'Requerido'),
  last_name: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || isValidPhoneNumber(val), {
      message: 'Número de teléfono inválido',
    }),
  company: z.string().optional(),
  position: z.string().optional(),
})
type RegistrationForm = z.infer<typeof registrationSchema>

// ---------- Fetch event by slug-uuid (public, no auth) ----------
// URL format: "{slug}-{event_uuid}", e.g. "mi-evento-22a30481-1ba5-4d69-91d1-338aa663bc3c"
async function fetchEventBySlug(slugWithId: string): Promise<Event> {
  const res = await apiClient.get<Event>(`/events/public/${slugWithId}/`)
  return res.data
}

export default function PublicEventPage() {
  const params = useParams()
  const slug = params.slug as string
  const [registered, setRegistered] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState<'confirmed' | 'waitlisted'>('confirmed')

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['public-event', slug],
    queryFn: () => fetchEventBySlug(slug),
  })

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegistrationForm>({ resolver: zodResolver(registrationSchema) })

  const onSubmit = async (data: RegistrationForm) => {
    if (!event) return
    try {
      const reg = await registrationsApi.register({ event_id: event.id, ...data })
      setRegistrationStatus(reg.status as 'confirmed' | 'waitlisted')
      setRegistered(true)
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.[0] ??
        err.response?.data?.detail ??
        'Error al registrarse. Intenta de nuevo.'
      setError('root', { message: msg })
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-4">
        <div className="h-10 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-64 rounded-lg bg-muted animate-pulse" />
      </div>
    )
  }

  if (isError || !event) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        Evento no encontrado.
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* Hero image */}
      {event.hero_image_url ? (
        <img
          src={event.hero_image_url}
          alt={event.title}
          className="w-full aspect-video object-cover rounded-xl"
          loading="lazy"
        />
      ) : (
        <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-600" />
      )}

      {/* Event info */}
      <div className="space-y-3">
        <p className="text-sm text-primary font-medium uppercase tracking-wide">
          {event.organizer_name}
        </p>
        <h1 className="text-3xl font-bold">{event.title}</h1>
        {event.description && (
          <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
        )}

        <div className="flex flex-col gap-2 pt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            {format(new Date(event.start_date), "EEEE d 'de' MMMM yyyy · HH:mm", { locale: es })}
            {' — '}
            {format(new Date(event.end_date), "HH:mm")}
          </span>
          {event.modality === 'in_person' ? (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              {event.location}
            </span>
          ) : event.modality === 'hybrid' ? (
            <>
              {event.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {event.location}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4 shrink-0" />
                Evento híbrido
              </span>
            </>
          ) : (
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4 shrink-0" />
              Evento virtual
            </span>
          )}
          {event.max_capacity !== null && (
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0" />
              {event.spots_remaining === 0
                ? 'Sin lugares disponibles — puedes registrarte en lista de espera'
                : `${event.spots_remaining} lugares disponibles`}
            </span>
          )}
        </div>
      </div>

      <Separator />

      {/* Registration form / success */}
      {!event.is_open_for_registration && !registered ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Este evento no está aceptando registros en este momento.
          </CardContent>
        </Card>
      ) : registered ? (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="py-10 text-center space-y-3">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold">
              {registrationStatus === 'confirmed' ? '¡Registro confirmado!' : '¡En lista de espera!'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {registrationStatus === 'confirmed'
                ? 'Te hemos registrado exitosamente. Recibirás un correo de confirmación con tu QR de acceso.'
                : 'El evento está lleno. Te notificaremos si se libera un lugar.'}
            </p>
            {registrationStatus === 'confirmed' &&
              event.modality !== 'in_person' &&
              event.virtual_access_url && (
                <div className="pt-2">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Link de acceso al evento:</p>
                  <a
                    href={event.virtual_access_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline underline-offset-2 break-all"
                  >
                    {event.virtual_access_url}
                  </a>
                </div>
              )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Registrarme al evento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {errors.root && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.root.message}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="first_name">Nombre *</Label>
                  <Input id="first_name" {...register('first_name')} />
                  {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="last_name">Apellido *</Label>
                  <Input id="last_name" {...register('last_name')} />
                  {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono</Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      id="phone"
                      international
                      defaultCountry="MX"
                      withCountryCallingCode
                      autoComplete="tel"
                      aria-label="Número de teléfono"
                      placeholder="+52 55 1234 5678"
                      value={field.value}
                      onChange={field.onChange}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-1 focus-within:ring-ring [&_input]:border-0 [&_input]:bg-transparent [&_input]:outline-none [&_input]:w-full"
                    />
                  )}
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company">Empresa</Label>
                  <Input id="company" {...register('company')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="position">Cargo</Label>
                  <Input id="position" {...register('position')} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : (
                  event.spots_remaining === 0
                    ? 'Unirse a la lista de espera'
                    : 'Confirmar registro'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
