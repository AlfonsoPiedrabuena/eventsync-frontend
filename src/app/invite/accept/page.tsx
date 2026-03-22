'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { authApi } from '@/lib/api/auth'

const acceptSchema = z
  .object({
    first_name: z.string().min(1, 'El nombre es requerido'),
    last_name: z.string().min(1, 'El apellido es requerido'),
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

type AcceptForm = z.infer<typeof acceptSchema>

function AcceptInvitationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Token de invitación no encontrado. El link puede ser inválido.')
    }
  }, [token])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptForm>({ resolver: zodResolver(acceptSchema) })

  const onSubmit = async (data: AcceptForm) => {
    if (!token) return
    setError(null)
    try {
      await authApi.acceptInvitation({ token, ...data })
      toast.success('¡Bienvenido al equipo! Ya puedes iniciar sesión.')
      router.push('/login')
    } catch (err: any) {
      const msg =
        err.response?.data?.token?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Error al aceptar la invitación. El token puede haber expirado.'
      setError(msg)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">EventSync</h1>
          <p className="text-muted-foreground mt-1">Has sido invitado a unirte</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-center mb-2">
              <UserCheck className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-center">Aceptar invitación</CardTitle>
            <CardDescription className="text-center">
              Completa tu perfil para acceder al espacio de trabajo
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre</Label>
                  <Input id="first_name" placeholder="Juan" {...register('first_name')} />
                  {errors.first_name && (
                    <p className="text-sm text-destructive">{errors.first_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input id="last_name" placeholder="Pérez" {...register('last_name')} />
                  {errors.last_name && (
                    <p className="text-sm text-destructive">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirm">Confirmar contraseña</Label>
                <Input
                  id="password_confirm"
                  type="password"
                  autoComplete="new-password"
                  {...register('password_confirm')}
                />
                {errors.password_confirm && (
                  <p className="text-sm text-destructive">{errors.password_confirm.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || !token}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activando cuenta...
                  </>
                ) : (
                  'Activar mi cuenta'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={null}>
      <AcceptInvitationContent />
    </Suspense>
  )
}
