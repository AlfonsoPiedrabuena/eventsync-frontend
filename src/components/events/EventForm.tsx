'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'
import { useHeroImageUpload } from '@/hooks/useHeroImageUpload'
import type { Event, EventCreatePayload } from '@/types'

// ---------- Validation schema ----------
const eventSchema = z
  .object({
    title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
    description: z.string().optional(),
    modality: z.enum(['in_person', 'virtual', 'hybrid']),
    location: z.string().optional(),
    location_url: z.string().url('URL inválida').optional().or(z.literal('')),
    virtual_access_url: z.string().url('URL inválida').optional().or(z.literal('')),
    start_date: z.string().min(1, 'La fecha de inicio es requerida'),
    end_date: z.string().min(1, 'La fecha de fin es requerida'),
    max_capacity: z.coerce.number().int().positive().optional().nullable(),
    visibility: z.enum(['public', 'private']).default('public'),
    audience_type: z.enum(['internal', 'external']).nullable().optional(),
    target_company: z.string().max(200).optional(),
  })
  .refine(
    (data) => data.modality !== 'in_person' || !!data.location,
    { message: 'Los eventos presenciales deben tener una ubicación', path: ['location'] }
  )
  .refine(
    (data) => !data.start_date || !data.end_date || data.start_date < data.end_date,
    { message: 'La fecha de fin debe ser posterior a la de inicio', path: ['end_date'] }
  )
  .refine(
    (data) => data.visibility !== 'private' || !!data.audience_type,
    { message: 'Un evento privado debe ser interno o externo', path: ['audience_type'] }
  )
  .refine(
    (data) => !(data.visibility === 'private' && data.audience_type === 'external') || !!data.target_company,
    { message: 'Un evento privado externo debe indicar la empresa destinataria', path: ['target_company'] }
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
  const [heroPreview, setHeroPreview] = useState<string | null>(defaultValues?.hero_image_url ?? null)
  const [heroUrl, setHeroUrl] = useState<string | null>(defaultValues?.hero_image_url ?? null)
  const { upload, uploading, progress, error: uploadError } = useHeroImageUpload(defaultValues?.id)

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
      modality: (defaultValues?.modality as EventFormValues['modality']) ?? 'in_person',
      location: defaultValues?.location ?? '',
      location_url: defaultValues?.location_url ?? '',
      virtual_access_url: defaultValues?.virtual_access_url ?? '',
      start_date: toDatetimeLocal(defaultValues?.start_date),
      end_date: toDatetimeLocal(defaultValues?.end_date),
      max_capacity: defaultValues?.max_capacity ?? null,
      visibility: (defaultValues?.visibility as EventFormValues['visibility']) ?? 'public',
      audience_type: (defaultValues?.audience_type as EventFormValues['audience_type']) ?? null,
      target_company: defaultValues?.target_company ?? '',
    },
  })

  const modality = watch('modality')
  const visibility = watch('visibility')
  const audienceType = watch('audience_type')
  const isPresencial = modality === 'in_person'
  const hasVirtual = modality === 'virtual' || modality === 'hybrid'

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Immediate local preview
    setHeroPreview(URL.createObjectURL(file))
    try {
      const url = await upload(file)
      setHeroUrl(url)
    } catch {
      setHeroPreview(heroUrl) // revert to last saved URL on error
    }
  }

  const handleFormSubmit = async (values: EventFormValues) => {
    await onSubmit({
      title: values.title,
      description: values.description,
      modality: values.modality,
      location: values.location,
      location_url: values.location_url,
      virtual_access_url: values.virtual_access_url || undefined,
      hero_image_url: heroUrl || undefined,
      start_date: new Date(values.start_date).toISOString(),
      end_date: new Date(values.end_date).toISOString(),
      max_capacity: values.max_capacity ?? null,
      visibility: values.visibility,
      audience_type: values.visibility === 'private' ? values.audience_type : null,
      target_company: values.visibility === 'private' && values.audience_type === 'external'
        ? values.target_company
        : undefined,
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

      {/* Modality */}
      <div className="space-y-1.5">
        <Label htmlFor="modality">Modalidad *</Label>
        <Select id="modality" {...register('modality')}>
          <option value="in_person">Presencial</option>
          <option value="virtual">Virtual</option>
          <option value="hybrid">Híbrido</option>
        </Select>
      </div>

      {/* Visibility */}
      <div className="space-y-1.5">
        <Label htmlFor="visibility">Visibilidad *</Label>
        <Select id="visibility" {...register('visibility')}>
          <option value="public">Público — visible para todos</option>
          <option value="private">Privado — solo por invitación</option>
        </Select>
        {errors.visibility && <p className="text-xs text-destructive">{errors.visibility.message}</p>}
      </div>

      {/* Audience type (private only) */}
      {visibility === 'private' && (
        <div className="space-y-1.5">
          <Label htmlFor="audience_type">Tipo de audiencia *</Label>
          <Select id="audience_type" {...register('audience_type')}>
            <option value="">Seleccionar...</option>
            <option value="internal">Interno — empleados</option>
            <option value="external">Externo — clientes / prospectos</option>
          </Select>
          {errors.audience_type && <p className="text-xs text-destructive">{errors.audience_type.message}</p>}
        </div>
      )}

      {/* Target company (private + external only) */}
      {visibility === 'private' && audienceType === 'external' && (
        <div className="space-y-1.5">
          <Label htmlFor="target_company">Empresa destinataria *</Label>
          <Input
            id="target_company"
            {...register('target_company')}
            placeholder="Ej. ACME Corporation"
          />
          {errors.target_company && <p className="text-xs text-destructive">{errors.target_company.message}</p>}
        </div>
      )}

      {/* Location (presencial or hybrid) */}
      {(isPresencial || modality === 'hybrid') && (
        <div className="space-y-1.5">
          <Label htmlFor="location">
            Ubicación {isPresencial ? '*' : ''}
          </Label>
          <Input id="location" {...register('location')} placeholder="Ej. Centro de Convenciones, CDMX" />
          {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
        </div>
      )}

      {/* Virtual access URL (virtual or hybrid) */}
      {hasVirtual && (
        <div className="space-y-1.5">
          <Label htmlFor="virtual_access_url">Link de acceso virtual</Label>
          <Input
            id="virtual_access_url"
            {...register('virtual_access_url')}
            placeholder="https://meet.google.com/..."
          />
          {errors.virtual_access_url && (
            <p className="text-xs text-destructive">{errors.virtual_access_url.message}</p>
          )}
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

      {/* Hero image */}
      <div className="space-y-1.5">
        <Label>Imagen de portada</Label>
        {heroPreview ? (
          <div className="relative">
            <img
              src={heroPreview}
              alt="Vista previa de portada"
              className="w-full aspect-video object-cover rounded-md border"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-background/80 hover:bg-background"
              onClick={() => { setHeroPreview(null); setHeroUrl(null) }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full aspect-video rounded-md border-2 border-dashed border-input bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">PNG, JPG o WebP · máx. 5MB</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        )}
        {uploading && (
          <p className="text-xs text-muted-foreground">Subiendo imagen… {progress}%</p>
        )}
        {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
      </div>

      <Button type="submit" disabled={isLoading || uploading} className="w-full">
        {isLoading ? 'Guardando...' : submitLabel}
      </Button>
    </form>
  )
}
