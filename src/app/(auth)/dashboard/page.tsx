'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Users, CheckSquare, TrendingUp, Plus, ArrowRight, BarChart2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { EventStatusBadge } from '@/components/events/EventStatusBadge'
import { useTenantDashboard } from '@/hooks/useAnalytics'
import type { EventStatus } from '@/types'

function StatCard({
  title, value, description, icon: Icon, loading = false,
}: {
  title: string
  value: string | number
  description: string
  icon: React.ElementType
  loading?: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading
          ? <div className="h-8 w-16 rounded bg-muted animate-pulse" />
          : <div className="text-2xl font-bold">{value}</div>
        }
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

const STATUS_LABELS: Partial<Record<EventStatus, string>> = {
  draft:     'Borrador',
  published: 'Publicados',
  closed:    'Cerrados',
  cancelled: 'Cancelados',
  finalized: 'Finalizados',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading } = useTenantDashboard()

  const publishedCount = data?.events_by_status?.published ?? 0
  const checkInRate = data && data.total_registrations > 0
    ? Math.round((data.total_checked_in / data.total_registrations) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hola, {user?.first_name}</h1>
          <p className="text-muted-foreground">Resumen general de tu organización</p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo evento
          </Link>
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total eventos"
          value={data?.total_events ?? 0}
          description={`${publishedCount} publicados actualmente`}
          icon={Calendar}
          loading={isLoading}
        />
        <StatCard
          title="Registros confirmados"
          value={data?.total_registrations ?? 0}
          description="En todos tus eventos"
          icon={Users}
          loading={isLoading}
        />
        <StatCard
          title="Total check-ins"
          value={data?.total_checked_in ?? 0}
          description="Asistentes verificados"
          icon={CheckSquare}
          loading={isLoading}
        />
        <StatCard
          title="Tasa de asistencia"
          value={`${checkInRate}%`}
          description="Check-in vs confirmados"
          icon={TrendingUp}
          loading={isLoading}
        />
      </div>

      {/* Status breakdown */}
      {data && Object.keys(data.events_by_status).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Eventos por estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {(Object.entries(data.events_by_status) as [EventStatus, number][]).map(([status, count]) => (
                <div key={status} className="flex items-center gap-2">
                  <EventStatusBadge status={status} />
                  <span className="text-sm font-medium">{count}</span>
                  <span className="text-xs text-muted-foreground">{STATUS_LABELS[status] ?? status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">

        {/* Upcoming events */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos eventos</CardTitle>
            <CardDescription>Eventos publicados con fecha futura</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-10 rounded bg-muted animate-pulse" />)}
              </div>
            ) : (data?.upcoming_events?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No hay eventos publicados próximos.
              </p>
            ) : (
              <div className="space-y-1">
                {data!.upcoming_events.map(ev => (
                  <Link
                    key={ev.id}
                    href={`/events/${ev.id}`}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-accent transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{ev.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(ev.start_date), "d MMM yyyy", { locale: es })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-xs text-muted-foreground">
                        {ev.confirmed}{ev.max_capacity ? `/${ev.max_capacity}` : ''} reg.
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top events */}
        <Card>
          <CardHeader>
            <CardTitle>Top eventos</CardTitle>
            <CardDescription>Por número de registros confirmados</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-10 rounded bg-muted animate-pulse" />)}
              </div>
            ) : (data?.top_events?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Sin datos aún.
              </p>
            ) : (
              <div className="space-y-1">
                {data!.top_events.map((ev, idx) => (
                  <Link
                    key={ev.id}
                    href={`/events/${ev.id}/analytics`}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-accent transition-colors"
                  >
                    <span className="text-sm font-mono text-muted-foreground w-5 text-right">{idx + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ev.title}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <EventStatusBadge status={ev.status} />
                      <span className="text-sm font-medium">{ev.confirmed}</span>
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/events/new">
                <Plus className="h-4 w-4 mr-1" />
                Crear evento
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/events">
                <Calendar className="h-4 w-4 mr-1" />
                Ver todos los eventos
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings/team">
                <Users className="h-4 w-4 mr-1" />
                Invitar miembro
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
