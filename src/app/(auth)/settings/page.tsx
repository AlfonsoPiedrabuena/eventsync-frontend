'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, Mail, Shield, Loader2, Send } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'

function InviteTeamMember() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('organizer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError(null)
    try {
      await apiClient.post('/auth/invitations/', { email, role })
      toast.success(`Invitación enviada a ${email}`)
      setEmail('')
    } catch (err: any) {
      setError(
        err.response?.data?.email?.[0] ||
        err.response?.data?.detail ||
        'Error al enviar la invitación'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Invitar miembro
        </CardTitle>
        <CardDescription>
          Invita a miembros de tu equipo. Recibirán un email con instrucciones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInvite} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="colega@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Rol</Label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="organizer">Organizador de Eventos</option>
              <option value="checkin_staff">Staff de Check-in</option>
              <option value="tenant_admin">Administrador</option>
            </select>
          </div>
          <Button type="submit" disabled={loading || !email}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar invitación
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Administra tu cuenta y equipo</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Mi perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Nombre</Label>
              <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Rol</Label>
              <Badge variant="secondary" className="text-xs">
                {user?.role}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{user?.email}</p>
            </div>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">
            Edición de perfil disponible en Sprint 3-4.
          </p>
        </CardContent>
      </Card>

      {/* Invite Team - only for admins */}
      {(user?.role === 'tenant_admin' || user?.role === 'super_admin') && (
        <InviteTeamMember />
      )}
    </div>
  )
}
