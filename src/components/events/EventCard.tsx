import Link from 'next/link'
import { Calendar, MapPin, Users, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { EventStatusBadge } from './EventStatusBadge'
import type { Event } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.start_date)
  const endDate = new Date(event.end_date)

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        {event.cover_image_url && (
          <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight line-clamp-2">{event.title}</h3>
            <EventStatusBadge status={event.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>
              {format(startDate, "d MMM yyyy · HH:mm", { locale: es })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {event.is_virtual ? (
              <Globe className="h-4 w-4 shrink-0" />
            ) : (
              <MapPin className="h-4 w-4 shrink-0" />
            )}
            <span className="line-clamp-1">
              {event.is_virtual ? 'Evento virtual' : event.location || '—'}
            </span>
          </div>

          {event.max_capacity !== null && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0" />
              <span>
                {event.registration_count} / {event.max_capacity} registros
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
