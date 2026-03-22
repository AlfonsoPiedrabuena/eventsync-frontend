'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Suspense } from 'react'
import { authApi } from '@/lib/api/auth'

// Request reset schema
const requestSchema = z.object({
  email: z.string().email('Email inválido'),
})

// Confirm reset schema
const confirmSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirm'],
  })

type RequestForm = z.infer<typeof requestSchema>
type ConfirmForm = z.infer<typeof confirmSchema>

function RequestResetForm() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestForm>({ resolver: zodResolver(requestSchema) })

  const onSubmit = async (data: RequestForm) => {
    setError(null)
    try {
      await authApi.requestPasswordReset(data)
      setSent(true)
      toast.success('Instrucciones enviadas a tu email')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al enviar el email. Intenta de nuevo.')
    }
  }

  if (sent) {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle>Revisa tu email</CardTitle>
          <CardDescription>
            Si existe una cuenta con ese email, recibirás instrucciones para restablecer tu
            contraseña.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button variant="outline" asChild>
            <Link href="/login">Volver al login</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Recuperar contraseña</CardTitle>
        <CardDescription>
          Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="tu@organizacion.com" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar instrucciones'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/login" className="text-sm text-primary hover:underline">
          Volver al login
        </Link>
      </CardFooter>
    </Card>
  )
}

function ConfirmResetForm({ token }: { token: string }) {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmForm>({ resolver: zodResolver(confirmSchema) })

  const onSubmit = async (data: ConfirmForm) => {
    setError(null)
    try {
      await authApi.confirmPasswordReset({ token, ...data })
      setDone(true)
      toast.success('Contraseña restablecida exitosamente')
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.token?.[0] || 'Error al restablecer. El token puede haber expirado.')
    }
  }

  if (done) {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle>¡Contraseña actualizada!</CardTitle>
          <CardDescription>Ya puedes iniciar sesión con tu nueva contraseña.</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button asChild className="w-full">
            <Link href="/login">Ir al login</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Nueva contraseña</CardTitle>
        <CardDescription>Ingresa tu nueva contraseña para la cuenta.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password_confirm">Confirmar contraseña</Label>
            <Input id="password_confirm" type="password" autoComplete="new-password" {...register('password_confirm')} />
            {errors.password_confirm && (
              <p className="text-sm text-destructive">{errors.password_confirm.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar nueva contraseña'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function PasswordResetContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">EventSync</h1>
        </div>
        {token ? <ConfirmResetForm token={token} /> : <RequestResetForm />}
      </div>
    </div>
  )
}

export default function PasswordResetPage() {
  return (
    <Suspense fallback={null}>
      <PasswordResetContent />
    </Suspense>
  )
}
