'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Menu } from 'lucide-react'

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  tenant_admin: 'Admin',
  organizer: 'Organizador',
  checkin_staff: 'Staff',
}

interface NavbarProps {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth()

  const initials = user
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : '?'

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      {/* Botón hamburger — solo visible en móvil */}
      <button
        onClick={onMenuClick}
        className="md:hidden rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        {user && (
          <>
            <div className="text-right">
              <p className="text-sm font-medium">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {roleLabels[user.role] || user.role}
            </Badge>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </>
        )}
      </div>
    </header>
  )
}
