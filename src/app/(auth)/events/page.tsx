'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { EventCard } from '@/components/events/EventCard'
import { useEvents } from '@/hooks/useEvents'
import type { EventStatus } from '@/types'

export default function EventsPage() {
  const [statusFilter, setStatusFilter] = useState<EventStatus | ''>('')
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useEvents(
    statusFilter ? { status: statusFilter } : undefined
  )

  const events = data?.results ?? []
  const filtered = search
    ? events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()))
    : events

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Eventos</h1>
          <p className="text-muted-foreground text-sm">
            {data?.count ?? 0} eventos en total
          </p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo evento
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as EventStatus | '')}
            className="w-[160px]"
          >
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="closed">Cerrado</option>
            <option value="cancelled">Cancelado</option>
            <option value="finalized">Finalizado</option>
          </Select>
        </div>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 rounded-lg border bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive">Error al cargar los eventos. Intenta de nuevo.</p>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="font-medium mb-1">
            {search || statusFilter ? 'Sin resultados' : 'No tienes eventos aún'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search || statusFilter
              ? 'Prueba con otros filtros.'
              : 'Crea tu primer evento para empezar.'}
          </p>
          {!search && !statusFilter && (
            <Button asChild size="sm">
              <Link href="/events/new">
                <Plus className="mr-2 h-4 w-4" />
                Crear evento
              </Link>
            </Button>
          )}
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
