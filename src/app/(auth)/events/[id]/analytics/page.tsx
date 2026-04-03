'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, CheckCircle2, Clock, XCircle, Mail, TrendingUp, BarChart2 } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useEvent } from '@/hooks/useEvents'
import { useEventSummary, useEventTimeline } from '@/hooks/useAnalytics'

// ── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, color = 'text-foreground',
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color?: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <Icon className={`h-5 w-5 mt-1 ${color} opacity-70`} />
        </div>
      </CardContent>
    </Card>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function EventAnalyticsPage() {
  const { id } = useParams<{ id: string }>()

  const { data: event } = useEvent(id)
  const { data: summary, isLoading: loadingSummary } = useEventSummary(id)
  const { data: timeline, isLoading: loadingTimeline } = useEventTimeline(id)

  // Build chart data joining daily + cumulative
  const timelineData = timeline?.labels.map((label, i) => ({
    date: label,
    Diario: timeline.daily[i],
    Acumulado: timeline.cumulative[i],
  })) ?? []

  // Donut-style data for status breakdown
  const statusData = summary
    ? [
        { name: 'Confirmados', value: summary.confirmed, fill: 'hsl(var(--primary))' },
        { name: 'Lista espera', value: summary.waitlisted, fill: '#f59e0b' },
        { name: 'Cancelados',  value: summary.cancelled,  fill: '#ef4444' },
      ].filter(d => d.value > 0)
    : []

  const checkinData = summary
    ? [
        { name: 'Check-in', value: summary.checked_in,  fill: '#22c55e' },
        { name: 'No show',  value: summary.no_show,      fill: '#f97316' },
      ]
    : []

  if (loadingSummary) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />)}
        </div>
        <div className="h-64 rounded-lg bg-muted animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart2 className="h-6 w-6" />
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Métricas de registros y asistencia para este evento.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Confirmados"
          value={summary?.confirmed ?? 0}
          sub={summary?.max_capacity ? `de ${summary.max_capacity} lugares` : undefined}
          icon={Users}
          color="text-primary"
        />
        <StatCard
          label="Check-in"
          value={`${summary?.check_in_rate ?? 0}%`}
          sub={`${summary?.checked_in ?? 0} asistentes`}
          icon={CheckCircle2}
          color="text-green-600"
        />
        <StatCard
          label="No shows"
          value={summary?.no_show ?? 0}
          sub="confirmados que no asistieron"
          icon={XCircle}
          color="text-orange-500"
        />
        <StatCard
          label="Emails enviados"
          value={summary?.emails_sent ?? 0}
          sub={summary?.emails_failed ? `${summary.emails_failed} fallidos` : 'todos enviados'}
          icon={Mail}
        />
      </div>

      {/* Capacity bar */}
      {summary?.capacity_utilization !== null && summary?.capacity_utilization !== undefined && (
        <Card>
          <CardContent className="pt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ocupación del evento</span>
              <span className="font-medium">{summary.capacity_utilization}%</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(100, summary.capacity_utilization)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{summary.confirmed} confirmados</span>
              <span>{summary.max_capacity} capacidad total</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Timeline chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Evolución de registros
          </CardTitle>
          <CardDescription>Registros diarios y acumulados desde la apertura del evento.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTimeline || timelineData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">
              {loadingTimeline ? 'Cargando...' : 'Sin datos de registros aún.'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={timelineData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAcum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="Acumulado"
                  stroke="hsl(var(--primary))"
                  fill="url(#colorAcum)"
                  strokeWidth={2}
                />
                <Bar dataKey="Diario" fill="hsl(var(--primary))" opacity={0.4} radius={[3,3,0,0]} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Status breakdown charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado de registros</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sin registros.</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={statusData} layout="vertical" margin={{ left: 16, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0,4,4,0]}>
                    {statusData.map((entry, i) => (
                      <rect key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Asistencia</CardTitle>
          </CardHeader>
          <CardContent>
            {(summary?.confirmed ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sin registros confirmados.</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={checkinData} layout="vertical" margin={{ left: 16, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0,4,4,0]}>
                    {checkinData.map((entry, i) => (
                      <rect key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
