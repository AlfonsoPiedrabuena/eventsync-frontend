'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'
import type { Event, EventCreatePayload } from '@/types'

// ---------- Validation schema ----------
const eventSchema = z
  .object({
    title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
    description: z.string().optional(),
    is_virtual: z.boolean(),
    location: z.string().optional(),
    location_url: z.string().url('URL inválida').optional().or(z.literal('')),
    start_date: z.string().min(1, 'La fecha de inicio es requerida'),
    end_date: z.string().min(1, 'La fecha de fin es requerida'),
    max_capacity: z.coerce.number().int().positive().optional().nullable(),
  })
  .refine(
    (data) => data.is_virtual || !!data.location,
    { message: 'Los eventos presenciales deben tener una ubicación', path: ['location'] }
  )
  .refine(
    (data) => !data.start_date || !data.end_date || data.start_date < data.end_date,
    { message: 'La fecha de fin debe ser posterior a la de inicio', path: ['end_date'] }
  )

type EventFormValues = z.infer<typeof eventSchema>

// ---------- Props ----------
interface EventFormProps {
  defaultValues?: Partial<Event>
  onSubmit: (data: EventCreatePayload) => Promise<void>
  isLoading?: boolean
  error?: string | null
  submitLabel?: string
}

// ---------- Helper: ISO string → datetime-local input value ----------
function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return ''
  // slice to 'YYYY-MM-DDTHH:mm'
  return iso.slice(0, 16)
}

// ---------- Component ----------
export function EventForm({
  defaultValues,
  onSubmit,
  isLoading,
  error,
  submitLabel = 'Guardar evento',
}: EventFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      is_virtual: defaultValues?.is_virtual ?? false,
      location: defaultValues?.location ?? '',
      location_url: defaultValues?.location_url ?? '',
      start_date: toDatetimeLocal(defaultValues?.start_date),
      end_date: toDatetimeLocal(defaultValues?.end_date),
      max_capacity: defaultValues?.max_capacity ?? null,
    },
  })

  const isVirtual = watch('is_virtual')

  const handleFormSubmit = async (values: EventFormValues) => {
    await onSubmit({
      title: values.title,
      description: values.description,
      is_virtual: values.is_virtual,
      location: values.location,
      location_url: values.location_url,
      // Convert datetime-local string to ISO with timezone offset
      start_date: new Date(values.start_date).toISOString(),
      end_date: new Date(values.end_date).toISOString(),
      max_capacity: values.max_capacity ?? null,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <p className="text-sm">{error}</p>
        </Alert>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Nombre del evento *</Label>
        <Input id="title" {...register('title')} placeholder="Ej. Conferencia Tech 2026" />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Describe el evento para los asistentes..."
          rows={4}
        />
      </div>

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="start_date">Fecha y hora de inicio *</Label>
          <Input id="start_date" type="datetime-local" {...register('start_date')} />
          {errors.start_date && <p className="text-xs text-destructive">{errors.start_date.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end_date">Fecha y hora de fin *</Label>
          <Input id="end_date" type="datetime-local" {...register('end_date')} />
          {errors.end_date && <p className="text-xs text-destructive">{errors.end_date.message}</p>}
        </div>
      </div>

      {/* Event type */}
      <div className="space-y-1.5">
        <Label htmlFor="is_virtual">Modalidad *</Label>
        <Select id="is_virtual" {...register('is_virtual', { setValueAs: v => v === 'true' })}>
          <option value="false">Presencial</option>
          <option value="true">Virtual</option>
        </Select>
      </div>

      {/* Location / URL */}
      {!isVirtual ? (
        <div className="space-y-1.5">
          <Label htmlFor="location">Ubicación *</Label>
          <Input id="location" {...register('location')} placeholder="Ej. Centro de Convenciones, CDMX" />
          {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="location_url">URL del evento virtual</Label>
          <Input id="location_url" {...register('location_url')} placeholder="https://meet.google.com/..." />
          {errors.location_url && <p className="text-xs text-destructive">{errors.location_url.message}</p>}
        </div>
      )}

      {/* Capacity */}
      <div className="space-y-1.5">
        <Label htmlFor="max_capacity">Capacidad máxima</Label>
        <Input
          id="max_capacity"
          type="number"
          min={1}
          {...register('max_capacity')}
          placeholder="Vacío = sin límite"
        />
        {errors.max_capacity && <p className="text-xs text-destructive">{errors.max_capacity.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Guardando...' : submitLabel}
      </Button>
    </form>
  )
}
