'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { registrationsApi } from '@/lib/api/registrations'

type PageStatus = 'loading' | 'cancelled' | 'already_cancelled' | 'error'

function CancelContent() {
  const searchParams = useSearchParams()
  const [pageStatus, setPageStatus] = useState<PageStatus>('loading')
  const [eventTitle, setEventTitle] = useState('')
  const hasCancelled = useRef(false)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setPageStatus('error')
      return
    }

    // Guard against React StrictMode double-invocation
    if (hasCancelled.current) return
    hasCancelled.current = true

    registrationsApi
      .cancelByToken(token)
      .then((data) => {
        if (data.status === 'already_cancelled') {
          setPageStatus('already_cancelled')
        } else {
          setPageStatus('cancelled')
          setEventTitle(data.event_title ?? '')
        }
      })
      .catch((err) => {
        const statusCode = err.response?.status
        if (statusCode === 404) {
          setPageStatus('error')
        } else {
          setPageStatus('error')
        }
      })
  }, [token])

  const icon = {
    loading: <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />,
    cancelled: <CheckCircle className="h-16 w-16 text-green-500" />,
    already_cancelled: <Info className="h-16 w-16 text-yellow-500" />,
    error: <XCircle className="h-16 w-16 text-destructive" />,
  }[pageStatus]

  const title = {
    loading: 'Cancelando tu registro...',
    cancelled: 'Registro cancelado',
    already_cancelled: 'Registro ya cancelado',
    error: 'Token inválido',
  }[pageStatus]

  const description = {
    loading: '',
    cancelled: eventTitle
      ? `Tu registro para "${eventTitle}" ha sido cancelado exitosamente. Te hemos enviado un correo de confirmación.`
      : 'Tu registro ha sido cancelado exitosamente.',
    already_cancelled: 'Este registro ya fue cancelado anteriormente.',
    error: 'El enlace de cancelación no es válido o ha expirado. Si necesitas ayuda, contacta al organizador del evento.',
  }[pageStatus]

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">{icon}</div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="text-sm leading-relaxed mt-1">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent />

        <CardFooter className="justify-center">
          <Button variant="outline" asChild>
            <Link href="/">Ir al inicio</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function CancelRegistrationPage() {
  return (
    <Suspense fallback={null}>
      <CancelContent />
    </Suspense>
  )
}
