# CLAUDE.md - EventSync Frontend

Este archivo proporciona guías técnicas para Claude Code al trabajar en el frontend de EventSync, una plataforma SaaS multi-tenant de gestión integral de eventos.

**Repo**: `eventsync-frontend` (extraído del monorepo `eventsync/` en FEAT-04)
**URL producción**: `https://app.eventsync.app`
**Backend companion repo**: `eventsync-backend` → `https://api.eventsync.app`

---

## Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **UI Library**: React 18+
- **Styling**: Tailwind CSS + shadcn/ui (componentes copiados a `components/ui/`)
- **State Management**: React Context (auth) + React Query / TanStack Query (server state)
- **Forms**: React Hook Form + Zod (validación)
- **HTTP Client**: Axios (con interceptores para JWT refresh automático)
- **QR Code**: qrcode.react (generación) + html5-qrcode (escaneo)
- **Charts**: Recharts
- **Phone Input**: react-phone-number-input (validación E.164)
- **Notifications**: Sonner (toasts)
- **File Storage**: Firebase Storage (imágenes hero de eventos)
- **Hosting**: Vercel (con auto-deploy desde `main`)

---

## Estructura del Proyecto

```
eventsync-frontend/          # Raíz del repo (antes: frontend/ en el monorepo)
├── src/
│   ├── app/                 # App Router (Next.js 14+)
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Homepage → redirect a /login
│   │   ├── providers.tsx    # React Query + AuthContext wrapper
│   │   ├── middleware.ts    # ⚠️ Edge Runtime — solo lee cookies, no localStorage
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify-email/
│   │   ├── password-reset/
│   │   ├── invite/accept/
│   │   ├── registrations/cancel/   # Cancelación self-service por token (público)
│   │   ├── (auth)/                 # Grupo de rutas autenticadas
│   │   │   ├── dashboard/          # KPIs globales del tenant
│   │   │   ├── settings/           # Configuración + invitación de miembros
│   │   │   └── events/
│   │   │       ├── new/            # Crear evento
│   │   │       └── [id]/           # Detalle del evento
│   │   │           ├── page.tsx    # Edición inline + transiciones de estado
│   │   │           ├── registrations/
│   │   │           ├── checkin/
│   │   │           ├── communications/
│   │   │           └── analytics/
│   │   └── (public)/
│   │       └── e/[slug]/    # Página pública del evento + formulario de registro
│   ├── components/
│   │   ├── ui/              # shadcn/ui components (NO son dependencias npm — se copian aquí)
│   │   ├── events/          # EventCard, EventForm, etc.
│   │   ├── registrations/
│   │   ├── analytics/       # Charts, KPI cards
│   │   └── layouts/         # Sidebar, Navbar
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts    # Axios + interceptores JWT refresh automático
│   │   │   ├── auth.ts
│   │   │   ├── events.ts
│   │   │   ├── registrations.ts
│   │   │   └── ...
│   │   ├── auth/            # Auth helpers
│   │   ├── firebase.ts      # Firebase Storage config + useHeroImageUpload hook
│   │   └── utils/
│   ├── hooks/               # Custom React Query hooks
│   ├── contexts/            # AuthContext
│   ├── types/               # TypeScript type definitions (index.ts)
│   └── styles/              # Global CSS
├── public/                  # Assets estáticos
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── .env.local.example
```

---

## Convenciones de Código

### Componentes React

```tsx
// components/events/EventCard.tsx
import { Event } from '@/types';

interface EventCardProps {
  event: Event;
  onEdit?: (eventId: string) => void;
}

export function EventCard({ event, onEdit }: EventCardProps) {
  // Component implementation
}
```

### Naming Conventions

- Componentes: PascalCase (`EventCard.tsx`)
- Hooks: camelCase con prefijo `use` (`useEvents.ts`)
- Utilities: camelCase (`formatDate.ts`)
- Types/Interfaces: PascalCase (`Event`, `User`)
- Constantes: UPPER_SNAKE_CASE
- Rutas de archivos: kebab-case para directorios de páginas

### API Client Pattern

```typescript
// lib/api/events.ts
import { apiClient } from './client';

export const eventsApi = {
  list: (params?) => apiClient.get('/events/', { params }),
  get: (id: string) => apiClient.get(`/events/${id}/`),
  create: (data) => apiClient.post('/events/', data),
  update: (id: string, data) => apiClient.patch(`/events/${id}/`, data),
};
```

### React Query para Server State

```tsx
// hooks/useEvents.ts
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api/events';

export function useEvents(filters?) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsApi.list(filters),
  });
}
```

### Auth Context Pattern

```tsx
// Dual storage: localStorage (para apiClient) + cookie (para middleware Edge Runtime)
// El middleware de Next.js corre en Edge y NO puede leer localStorage, solo cookies
document.cookie = `access_token=${token}; path=/; max-age=900; SameSite=Strict`
```

**Login usa `window.location.href` (no `router.push`)** para propagar la cookie al middleware Edge antes de la navegación.

### Componentes shadcn/ui

- Los componentes shadcn NO son dependencias npm — se copian directamente a `components/ui/`
- Requieren: `tailwindcss-animate`, `lucide-react`, `class-variance-authority`, `@radix-ui/*`
- Instalar dependencias: `npm install --cache /tmp/npm-cache <paquetes>` (workaround si hay permisos en cache)
- Agregar componente: `npx shadcn-ui@latest add {component}`

---

## Tipos TypeScript (src/types/index.ts)

Tipos implementados:
- `User`, `Tenant`
- `Event`, `EventModality` (in_person/virtual/hybrid), `EventVisibility` (public/private), `EventAudienceType` (internal/external)
- `Registration`, `RegistrationFormField`
- `CheckinResponse`, `EventStats`
- `EmailLog`, `EmailSegment`

---

## Hooks React Query Implementados

```
useEvents, useEvent, useCreateEvent, useUpdateEvent, useDeleteEvent, useTransitionEvent
useRegistrations, useRegisterForEvent, useCancelRegistration
useEventStats, useCheckinSearch, useCheckinByToken, useCheckinManual
useEmailLogs, useSendManualEmail
useTenantDashboard, useEventSummary, useEventTimeline
```

---

## Páginas Implementadas

### Autenticación (sin auth requerida)
| Ruta | Descripción |
|---|---|
| `/login` | Login con email + contraseña |
| `/register` | Registro de nueva organización |
| `/verify-email` | Verificación de email por token |
| `/password-reset` | Solicitud + confirmación de reset de contraseña |
| `/invite/accept` | Aceptar invitación de miembro |
| `/registrations/cancel` | Cancelación self-service por token |

### Autenticadas (requieren JWT válido)
| Ruta | Descripción |
|---|---|
| `/dashboard` | KPIs globales del tenant, breakdown por estado, top eventos |
| `/settings` | Invitación de miembros, configuración del tenant |
| `/events` | Lista de eventos con filtro por estado y búsqueda |
| `/events/new` | Crear evento (formulario con validación Zod, hero image upload) |
| `/events/[id]` | Detalle con edición inline, transiciones de estado, liga pública |
| `/events/[id]/registrations` | Panel organizador (lista, filtros, cancelar, export CSV) |
| `/events/[id]/checkin` | Check-in staff: scanner QR + búsqueda manual + stats |
| `/events/[id]/communications` | Enviar email segmentado / historial de envíos |
| `/events/[id]/analytics` | Métricas, gráfica de evolución, barras de asistencia |

### Públicas (sin autenticación)
| Ruta | Descripción |
|---|---|
| `/e/[slug]-[event_uuid]` | Página pública del evento + formulario de registro con campos dinámicos |

---

## Variables de Entorno (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase Storage (imágenes hero de eventos)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

## Lecciones Aprendidas y Notas Críticas

### Middleware Edge Runtime — solo cookies

El middleware de Next.js (`src/middleware.ts`) corre en Edge Runtime y **no puede leer `localStorage`**. La autenticación de rutas se basa en cookies. El access token se guarda en ambos:
- `localStorage` → para el Axios client (`apiClient`)
- Cookie → para el middleware de protección de rutas

### `useSearchParams()` requiere `<Suspense>`

En Next.js 14, `useSearchParams()` requiere un boundary `<Suspense>`. Extraer el componente que lo usa a un hijo y envolver en el `page.tsx`:

```tsx
// page.tsx
export default function Page() {
  return (
    <Suspense fallback={null}>
      <ComponentQueUsaSearchParams />
    </Suspense>
  )
}
```

### React StrictMode y `useEffect` doble

React 18 en desarrollo ejecuta `useEffect` dos veces. Para operaciones one-shot (como verificación de email), usar `useRef` como guard:

```tsx
const hasRun = useRef(false)
useEffect(() => {
  if (!token || hasRun.current) return
  hasRun.current = true
  api.verifyEmail(token).then(...)
}, [token])
```

### Limpiar `.next/` tras agregar dependencias con errores

Si el dev server lanza `Internal Server Error` con `ETIMEDOUT write` tras agregar nuevas dependencias:

```bash
lsof -iTCP:3000 -sTCP:LISTEN | awk 'NR>1 {print $2}' | xargs kill
rm -rf .next
npm run dev
```

Los errores `ETIMEDOUT write` en el terminal son HMR WebSocket disconnects — siempre benignos.

### JWT Interceptor — race conditions

El Axios client (`lib/api/client.ts`) maneja auto-refresh en 401:
- Flag `_retry` previene loops infinitos
- Logout automático si el refresh falla
- Requests concurrentes durante refresh son manejadas via cola

### Firebase Storage — Hero Images

- `lib/firebase.ts`: inicialización de Firebase app
- Hook `useHeroImageUpload`: progreso de upload, validación de tipo/tamaño, URL de descarga
- Las URLs se guardan en el backend como `hero_image_url` (string)

---

## Comandos Útiles

```bash
# Setup
npm install
cp .env.local.example .env.local
# Editar .env.local

# Desarrollo
npm run dev

# Build
npm run build
npm run start

# Lint y tipos
npm run lint
npm run type-check  # tsc --noEmit

# Agregar componente shadcn/ui
npx shadcn-ui@latest add {component}

# Limpiar cache de Next.js
rm -rf .next
```

---

## Consideraciones de Seguridad

- Nunca commitear `.env.local` — contiene Firebase API keys y URLs sensibles
- `SameSite=Strict` en cookies de auth para proteger contra CSRF
- Validar inputs con Zod antes de enviar al API
- Las variables `NEXT_PUBLIC_*` son visibles en el bundle del cliente — nunca poner secrets aquí

---

**Última actualización**: 2026-04-07
**Versión**: 1.0.0 — separado del monorepo en FEAT-04
