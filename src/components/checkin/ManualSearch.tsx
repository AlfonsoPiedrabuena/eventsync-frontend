'use client'

import { useState } from 'react'
import { Search, UserCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckinResultCard } from './CheckinResultCard'
import { useCheckinSearch, useCheckinManual } from '@/hooks/useCheckin'
import type { CheckinResponse, Registration } from '@/types'

interface ManualSearchProps {
  eventId: string
}

export function ManualSearch({ eventId }: ManualSearchProps) {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<CheckinResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checkingInId, setCheckingInId] = useState<string | null>(null)

  const { data, isFetching } = useCheckinSearch(eventId, query)
  const checkinManual = useCheckinManual(eventId)

  const handleCheckin = async (reg: Registration) => {
    setCheckingInId(reg.id)
    setResult(null)
    setError(null)
    try {
      const response = await checkinManual.mutateAsync(reg.id)
      setResult(response)
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.[0] ??
        err?.response?.data?.error ??
        'Error al procesar el check-in.'
      setError(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setCheckingInId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o email…"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setResult(null)
            setError(null)
          }}
          className="pl-9"
        />
      </div>

      {query.length > 0 && query.length < 2 && (
        <p className="text-xs text-muted-foreground px-1">Escribe al menos 2 caracteres.</p>
      )}

      {query.length >= 2 && (
        <div className="rounded-lg border divide-y">
          {isFetching ? (
            <div className="space-y-2 p-4">
              {[1, 2].map(i => (
                <div key={i} className="h-10 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : !data?.results.length ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Sin resultados para &ldquo;{query}&rdquo;
            </div>
          ) : (
            data.results.map(reg => (
              <SearchResultRow
                key={reg.id}
                registration={reg}
                onCheckin={handleCheckin}
                isLoading={checkingInId === reg.id}
              />
            ))
          )}
        </div>
      )}

      <CheckinResultCard result={result} error={error} />
    </div>
  )
}

function SearchResultRow({
  registration: reg,
  onCheckin,
  isLoading,
}: {
  registration: Registration
  onCheckin: (reg: Registration) => Promise<void>
  isLoading: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/40 transition-colors">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">{reg.full_name}</p>
          {reg.checked_in && (
            <Badge variant="outline" className="text-xs text-green-600 border-green-300 shrink-0">
              Ya ingresó
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{reg.email}</p>
        {reg.company && (
          <p className="text-xs text-muted-foreground">{reg.company}</p>
        )}
      </div>
      <Button
        size="sm"
        variant={reg.checked_in ? 'outline' : 'default'}
        disabled={isLoading}
        onClick={() => onCheckin(reg)}
        className="shrink-0"
      >
        <UserCheck className="h-4 w-4 mr-1" />
        {isLoading ? 'Procesando…' : reg.checked_in ? 'Reingresar' : 'Check-in'}
      </Button>
    </div>
  )
}
