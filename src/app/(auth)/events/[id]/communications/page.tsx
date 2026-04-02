'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, Send, History, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useEvent } from '@/hooks/useEvents'
import { useEmailLogs, useSendManualEmail } from '@/hooks/useCommunications'
import type { EmailSegment } from '@/types'

// ── Form schema ───────────────────────────────────────────────────────────────

const sendSchema = z.object({
  subject: z.string().min(1, 'El asunto es requerido').max(300),
  message: z.string().min(1, 'El mensaje es requerido'),
  segment: z.enum(['all', 'confirmed', 'waitlisted', 'checked_in', 'no_show']),
})
type SendForm = z.infer<typeof sendSchema>

const SEGMENTS: { value: EmailSegment; label: string; description: string }[] = [
  { value: 'all',        label: 'Todos',             description: 'Confirmados + lista de espera' },
  { value: 'confirmed',  label: 'Confirmados',        description: 'Solo asistentes confirmados' },
  { value: 'waitlisted', label: 'Lista de espera',    description: 'Solo en lista de espera' },
  { value: 'checked_in', label: 'Asistentes',         description: 'Hicieron check-in' },
  { value: 'no_show',    label: 'No shows',           description: 'Confirmados que no asistieron' },
]

// ── Email type labels & colors ────────────────────────────────────────────────

const EMAIL_TYPE_STYLES: Record<string, string> = {
  confirmation: 'bg-blue-100 text-blue-700',
  reminder_24h: 'bg-purple-100 text-purple-700',
  reminder_1h:  'bg-purple-100 text-purple-700',
  post_event:   'bg-orange-100 text-orange-700',
  manual:       'bg-zinc-100 text-zinc-700',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SendEmailTab({ eventId }: { eventId: string }) {
  const sendEmail = useSendManualEmail(eventId)
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SendForm>({
    resolver: zodResolver(sendSchema),
    defaultValues: { segment: 'all' },
  })
  const segment = watch('segment')

  const onSubmit = async (data: SendForm) => {
    try {
      await sendEmail.mutateAsync(data)
      toast.success('Envío en progreso', {
        description: 'Los emails se despacharán en breve a los destinatarios seleccionados.',
      })
      reset({ segment: 'all' })
    } catch {
      toast.error('Error al enviar', { description: 'Intenta de nuevo en un momento.' })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar email a asistentes</CardTitle>
        <CardDescription>
          El email se enviará de forma asíncrona. Puedes revisar el historial de envíos en la otra pestaña.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Segment */}
          <div className="space-y-1.5">
            <Label htmlFor="segment">Destinatarios</Label>
            <Select
              id="segment"
              value={segment}
              onChange={(e) => setValue('segment', e.target.value as EmailSegment)}
            >
              {SEGMENTS.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label} — {s.description}
                </option>
              ))}
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="subject">Asunto</Label>
            <Input
              id="subject"
              placeholder="Información importante sobre el evento"
              {...register('subject')}
            />
            {errors.subject && (
              <p className="text-xs text-destructive">{errors.subject.message}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              rows={6}
              placeholder="Escribe aquí el contenido del email..."
              {...register('message')}
            />
            {errors.message && (
              <p className="text-xs text-destructive">{errors.message.message}</p>
            )}
          </div>

          <Button type="submit" disabled={sendEmail.isPending} className="w-full">
            {sendEmail.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar email
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function EmailLogsTab({ eventId }: { eventId: string }) {
  const { data: logs, isLoading } = useEmailLogs(eventId)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 rounded-lg border bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Sin historial de envíos</p>
        <p className="text-sm mt-1">Los emails enviados aparecerán aquí.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {logs.map(log => (
        <div
          key={log.id}
          className="flex items-start justify-between gap-4 rounded-lg border px-4 py-3 text-sm"
        >
          <div className="flex items-start gap-3 min-w-0">
            {log.status === 'sent' ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${EMAIL_TYPE_STYLES[log.email_type] ?? 'bg-muted text-muted-foreground'}`}
                >
                  {log.email_type_display}
                </span>
                <span className="font-medium truncate">{log.recipient_name}</span>
                <span className="text-muted-foreground truncate">{log.recipient_email}</span>
              </div>
              <p className="text-muted-foreground truncate mt-0.5">{log.subject}</p>
              {log.error_message && (
                <p className="text-xs text-destructive mt-1">{log.error_message}</p>
              )}
            </div>
          </div>

          <div className="shrink-0 text-right space-y-1">
            <Badge variant={log.status === 'sent' ? 'default' : 'destructive'} className="text-xs">
              {log.status_display}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {log.sent_at
                ? format(new Date(log.sent_at), "d MMM · HH:mm", { locale: es })
                : format(new Date(log.created_at), "d MMM · HH:mm", { locale: es })
              }
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = 'send' | 'logs'

export default function CommunicationsPage() {
  const params = useParams()
  const id = params.id as string
  const [activeTab, setActiveTab] = useState<Tab>('send')

  const { data: event, isLoading } = useEvent(id)

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-64 rounded-lg border bg-muted animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/events/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {event?.title ?? 'Evento'}
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Comunicaciones</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Envía emails a los asistentes y revisa el historial de envíos.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => setActiveTab('send')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'send'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Send className="h-4 w-4" />
          Enviar email
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="h-4 w-4" />
          Historial
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'send' ? (
        <SendEmailTab eventId={id} />
      ) : (
        <EmailLogsTab eventId={id} />
      )}
    </div>
  )
}
