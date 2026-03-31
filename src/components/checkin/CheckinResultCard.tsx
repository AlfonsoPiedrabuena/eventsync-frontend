'use client'

import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { CheckinResponse } from '@/types'

interface CheckinResultCardProps {
  result: CheckinResponse | null
  error: string | null
}

export function CheckinResultCard({ result, error }: CheckinResultCardProps) {
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 flex items-start gap-3">
        <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-destructive">Check-in fallido</p>
          <p className="text-sm text-muted-foreground mt-0.5">{error}</p>
        </div>
      </div>
    )
  }

  if (!result) return null

  if (result.already_checked_in) {
    return (
      <div className="rounded-lg border border-yellow-400/40 bg-yellow-50 p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-800">Ya realizó check-in</p>
          <p className="text-sm font-semibold mt-1">{result.registration.full_name}</p>
          <p className="text-sm text-muted-foreground">{result.registration.email}</p>
          {result.registration.checked_in_at && (
            <p className="text-xs text-muted-foreground mt-1">
              Ingresó el{' '}
              {format(new Date(result.registration.checked_in_at), "d MMM yyyy 'a las' HH:mm", {
                locale: es,
              })}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-green-400/40 bg-green-50 p-4 flex items-start gap-3">
      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-green-800">Check-in exitoso</p>
        <p className="text-sm font-semibold mt-1">{result.registration.full_name}</p>
        <p className="text-sm text-muted-foreground">{result.registration.email}</p>
        {result.registration.company && (
          <p className="text-xs text-muted-foreground">{result.registration.company}</p>
        )}
      </div>
    </div>
  )
}
