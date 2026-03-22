'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { authApi } from '@/lib/api/auth'

const registerSchema = z
  .object({
    organization_name: z.string().min(2, 'El nombre de la organización debe tener al menos 2 caracteres'),
    first_name: z.string().min(1, 'El nombre es requerido'),
    last_name: z.string().min(1, 'El apellido es requerido'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirm'],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [registered, setRegistered] = useState(false)
  const [tenantName, setTenantName] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: RegisterForm) => {
    setError(null)
    try {
      await authApi.register(data)
      setTenantName(data.organization_name)
      setRegistered(true)
      toast.success('¡Organización registrada exitosamente!')
    } catch (err: any) {
      const responseData = err.response?.data
      if (responseData) {
        const firstError =
          responseData.email?.[0] ||
          responseData.organization_name?.[0] ||
          responseData.password?.[0] ||
          responseData.non_field_errors?.[0] ||
          responseData.detail ||
          'Error al registrar la organización'
        setError(firstError)
      } else {
        setError('Error de conexión. Verifica tu internet.')
      }
    }
  }

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle>¡Registro exitoso!</CardTitle>
            <CardDescription>
              Tu organización <strong>{tenantName}</strong> ha sido creada correctamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Te enviamos un email de verificación. Revisa tu bandeja de entrada y haz clic en el
              enlace para activar tu cuenta.
            </p>
            <p className="text-xs text-muted-foreground">
              En desarrollo, el token aparece en la consola del servidor Django.
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button onClick={() => router.push('/login')} className="w-full">
              Ir al login
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">EventSync</h1>
          <p className="text-muted-foreground mt-1">Crea tu organización</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registrar organización</CardTitle>
            <CardDescription>
              Crea tu cuenta de administrador y espacio de trabajo
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
                <Label htmlFor="organization_name">Nombre de la organización</Label>
                <Input
                  id="organization_name"
                  placeholder="Mi Empresa S.A."
                  {...register('organization_name')}
                />
                {errors.organization_name && (
                  <p className="text-sm text-destructive">{errors.organization_name.message}</p>
                )}
              </div>

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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@miempresa.com"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Mínimo 8 caracteres, una mayúscula y un número
                </p>
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando organización...
                  </>
                ) : (
                  'Crear organización'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Iniciar sesión
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
