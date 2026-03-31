'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, QrCode, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CheckinStats } from '@/components/checkin/CheckinStats'
import { QRScanner } from '@/components/checkin/QRScanner'
import { ManualSearch } from '@/components/checkin/ManualSearch'
import { useEvent } from '@/hooks/useEvents'

type Tab = 'scanner' | 'manual'

const TABS: { value: Tab; label: string; icon: typeof QrCode }[] = [
  { value: 'scanner', label: 'Escanear QR', icon: QrCode },
  { value: 'manual', label: 'Búsqueda manual', icon: Search },
]

export default function CheckinPage() {
  const params = useParams()
  const eventId = params.id as string
  const [activeTab, setActiveTab] = useState<Tab>('scanner')

  const { data: event } = useEvent(eventId)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/events/${eventId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {event?.title ?? 'Evento'}
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <QrCode className="h-5 w-5 text-muted-foreground" />
          Check-in
        </h1>
      </div>

      {/* Live stats */}
      <CheckinStats eventId={eventId} />

      {/* Tab switcher */}
      <div className="flex gap-2">
        {TABS.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            variant={activeTab === value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(value)}
          >
            <Icon className="h-4 w-4 mr-1.5" />
            {label}
          </Button>
        ))}
      </div>

      {/* Tab content */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-muted-foreground font-normal">
            {activeTab === 'scanner'
              ? 'Escanea el código QR del asistente para registrar su ingreso.'
              : 'Busca al asistente por nombre o email para hacer check-in manual.'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeTab === 'scanner' ? (
            <QRScanner eventId={eventId} />
          ) : (
            <ManualSearch eventId={eventId} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
