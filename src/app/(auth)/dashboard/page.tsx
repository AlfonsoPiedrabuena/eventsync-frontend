'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Users, CheckSquare, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// Stat card component for the overview metrics
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string
  value: string | number
  description: string
  icon: React.ElementType
  trend?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <Badge variant="secondary" className="mt-2 text-xs">
            {trend}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Hola, {user?.first_name} 👋
          </h1>
          <p className="text-muted-foreground">
            Aquí tienes un resumen de tu actividad
          </p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo evento
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Eventos activos"
          value="—"
          description="Próximos 30 días"
          icon={Calendar}
          trend="Sprint 3-4"
        />
        <StatCard
          title="Total asistentes"
          value="—"
          description="Registros confirmados"
          icon={Users}
          trend="Sprint 5-6"
        />
        <StatCard
          title="Check-ins hoy"
          value="—"
          description="Asistentes verificados"
          icon={CheckSquare}
          trend="Sprint 7-8"
        />
        <StatCard
          title="Tasa de asistencia"
          value="—"
          description="Promedio de tus eventos"
          icon={TrendingUp}
          trend="Sprint 11-12"
        />
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
            <CardDescription>Lo más común que necesitas hacer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: '/events/new', label: 'Crear evento', icon: Calendar },
              { href: '/settings/team', label: 'Invitar miembro del equipo', icon: Users },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos sprints</CardTitle>
            <CardDescription>Funcionalidades en desarrollo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { sprint: 'S3-4', feature: 'Gestión de Eventos', status: 'Próximo' },
                { sprint: 'S5-6', feature: 'Registro de Asistentes', status: 'Planificado' },
                { sprint: 'S7-8', feature: 'Check-in por QR', status: 'Planificado' },
                { sprint: 'S9-10', feature: 'Comunicaciones (Email)', status: 'Planificado' },
              ].map(({ sprint, feature, status }) => (
                <div key={sprint} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono">
                      {sprint}
                    </Badge>
                    <span className="text-sm">{feature}</span>
                  </div>
                  <Badge variant={status === 'Próximo' ? 'default' : 'secondary'} className="text-xs">
                    {status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
