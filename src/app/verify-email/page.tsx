'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { authApi } from '@/lib/api/auth'

type Status = 'loading' | 'success' | 'error'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')
  const hasVerified = useRef(false)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token de verificación no encontrado en la URL.')
      return
    }

    // Guard against React StrictMode double-invocation
    if (hasVerified.current) return
    hasVerified.current = true

    authApi
      .verifyEmail(token)
      .then(() => {
        setStatus('success')
        setMessage('Tu email ha sido verificado. Ya puedes iniciar sesión.')
      })
      .catch((err) => {
        const detail = err.response?.data?.error || err.response?.data?.detail || 'El token es inválido o ha expirado.'
        setStatus('error')
        setMessage(detail)
      })
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {status === 'loading' && <Loader2 className="h-16 w-16 animate-spin text-primary" />}
            {status === 'success' && <CheckCircle className="h-16 w-16 text-green-500" />}
            {status === 'error' && <XCircle className="h-16 w-16 text-destructive" />}
          </div>
          <CardTitle>
            {status === 'loading' && 'Verificando...'}
            {status === 'success' && '¡Email verificado!'}
            {status === 'error' && 'Error de verificación'}
          </CardTitle>
          <CardDescription>{status !== 'loading' && message}</CardDescription>
        </CardHeader>

        <CardContent />

        <CardFooter className="justify-center gap-3">
          {status === 'success' && (
            <Button onClick={() => router.push('/login')} className="w-full">
              Ir al login
            </Button>
          )}
          {status === 'error' && (
            <Button variant="outline" asChild className="w-full">
              <Link href="/register">Volver al registro</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  )
}
