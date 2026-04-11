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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Users, Mail, Shield, Loader2, Send, UserX, Clock } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'
import { useTeamMembers, useUpdateTeamMember, useDeactivateTeamMember } from '@/hooks/useTeam'
import { useQuery } from '@tanstack/react-query'
import { TeamMember } from '@/types'

// ── Role helpers ──────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  tenant_admin: 'Administrador',
  organizer: 'Organizador',
  checkin_staff: 'Staff Check-in',
}

const ROLE_BADGE_CLASS: Record<string, string> = {
  tenant_admin: 'bg-zinc-900 text-white hover:bg-zinc-800',
  organizer: 'bg-blue-600 text-white hover:bg-blue-500',
  checkin_staff: 'bg-green-600 text-white hover:bg-green-500',
}

const ROLE_AVATAR_CLASS: Record<string, string> = {
  tenant_admin: 'bg-zinc-200 text-zinc-800',
  organizer: 'bg-blue-100 text-blue-700',
  checkin_staff: 'bg-green-100 text-green-700',
}

function initials(member: TeamMember) {
  return `${member.first_name[0] ?? ''}${member.last_name[0] ?? ''}`.toUpperCase()
}

// ── Team section ──────────────────────────────────────────────────────────────

function TeamSection() {
  const { user } = useAuth()
  const { data: members = [], isLoading } = useTeamMembers()
  const updateMember = useUpdateTeamMember()
  const deactivateMember = useDeactivateTeamMember()

  const [confirmTarget, setConfirmTarget] = useState<TeamMember | null>(null)
  const isAdmin = user?.role === 'tenant_admin' || user?.role === 'super_admin'

  function handleRoleChange(member: TeamMember, newRole: TeamMember['role']) {
    updateMember.mutate(
      { userId: member.id, data: { role: newRole } },
      {
        onSuccess: () => toast.success(`Rol de ${member.full_name} actualizado`),
        onError: () => toast.error('Error al cambiar el rol'),
      }
    )
  }

  function handleDeactivateConfirm() {
    if (!confirmTarget) return
    deactivateMember.mutate(confirmTarget.id, {
      onSuccess: () => {
        toast.success(`Acceso de ${confirmTarget.full_name} desactivado`)
        setConfirmTarget(null)
      },
      onError: () => {
        toast.error('Error al desactivar el acceso')
        setConfirmTarget(null)
      },
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Equipo activo
          </CardTitle>
          <CardDescription>
            Miembros con acceso a esta organización.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No hay otros miembros en el equipo todavía.
            </p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  {/* Avatar */}
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className={ROLE_AVATAR_CLASS[member.role] ?? 'bg-muted'}>
                      {initials(member)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{member.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>

                  {/* Role badge / dropdown */}
                  {isAdmin ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member, e.target.value as TeamMember['role'])}
                      disabled={updateMember.isPending}
                      className="h-7 rounded border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="tenant_admin">Administrador</option>
                      <option value="organizer">Organizador</option>
                      <option value="checkin_staff">Staff Check-in</option>
                    </select>
                  ) : (
                    <Badge className={`text-xs ${ROLE_BADGE_CLASS[member.role] ?? ''}`}>
                      {ROLE_LABELS[member.role] ?? member.role}
                    </Badge>
                  )}

                  {/* Date joined */}
                  <span className="hidden sm:block text-xs text-muted-foreground shrink-0">
                    {member.date_joined}
                  </span>

                  {/* Deactivate button */}
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-destructive hover:text-destructive"
                      onClick={() => setConfirmTarget(member)}
                    >
                      <UserX className="h-4 w-4" />
                      <span className="sr-only">Desactivar</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation dialog */}
      <Dialog open={!!confirmTarget} onOpenChange={(open) => !open && setConfirmTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Desactivar acceso?</DialogTitle>
            <DialogDescription>
              {confirmTarget?.full_name} perderá el acceso inmediatamente. Esta acción se puede
              revertir volviendo a invitar al usuario.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivateConfirm}
              disabled={deactivateMember.isPending}
            >
              {deactivateMember.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Desactivar acceso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Pending invitations ───────────────────────────────────────────────────────

function PendingInvitations() {
  const { data, isLoading } = useQuery({
    queryKey: ['invitations'],
    queryFn: () => apiClient.get('/auth/invitations/').then(r => r.data),
  })

  const pending = (data?.results ?? data ?? []).filter(
    (inv: { status: string }) => inv.status === 'pending'
  )

  if (isLoading) return null
  if (pending.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Invitaciones pendientes
        </CardTitle>
        <CardDescription>
          Estas personas aún no han aceptado su invitación.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pending.map((inv: { id: string; email: string; role: string; created_at: string }) => (
            <div
              key={inv.id}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{inv.email}</p>
                <p className="text-xs text-muted-foreground">
                  {ROLE_LABELS[inv.role] ?? inv.role} · enviada {inv.created_at.slice(0, 10)}
                </p>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">Pendiente</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Invite form ───────────────────────────────────────────────────────────────

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
          <Mail className="h-5 w-5" />
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'tenant_admin' || user?.role === 'super_admin'

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
              <Badge
                className={`text-xs ${ROLE_BADGE_CLASS[user?.role ?? ''] ?? ''}`}
              >
                {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
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

      {/* Team — visible for all authenticated users */}
      <TeamSection />

      {/* Pending invitations — only for admins */}
      {isAdmin && <PendingInvitations />}

      {/* Invite form — only for admins */}
      {isAdmin && <InviteTeamMember />}
    </div>
  )
}
