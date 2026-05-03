# CLAUDE.md - EventSync Frontend

Este archivo proporciona guías técnicas para Claude Code al trabajar en el frontend de EventSync, una plataforma SaaS multi-tenant de gestión integral de eventos.

**Repo de producción**: `https://github.com/AlfonsoPiedrabuena/eventsync-frontend` → desplegado en Vercel (`https://eventsync.cloud`)
**Backend companion repo**: `eventsync-backend` → `https://api.eventsync.cloud`

> ⚠️ **IMPORTANTE — Deploy**: Vercel está conectado a `eventsync-frontend`, NO al monorepo `eventsync`.
> Los cambios en `frontend/` del monorepo **NO se despliegan automáticamente**.
> Para desplegar a producción, hacer push a `https://github.com/AlfonsoPiedrabuena/eventsync-frontend.git`.

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
│   │   ├── page.tsx         # Homepage → renderiza LandingPage (marketing pública)
│   │   ├── providers.tsx    # React Query + AuthContext wrapper
│   │   ├── middleware.ts    # ⚠️ Edge Runtime — solo lee cookies, no localStorage
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify-email/
│   │   ├── password-reset/
│   │   ├── invite/accept/
│   │   ├── registrations/cancel/   # Cancelación self-service por token (público)
│   │   ├── api/                    # Next.js API routes (server-side)
│   │   │   └── hubspot/register/   # Lead capture → HubSpot CRM (contact + company + association)
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
│   │       ├── e/[slug]/            # Página pública del evento + formulario de registro
│   │       └── aviso-de-privacidad/ # Aviso de privacidad (link desde landing form)
│   ├── components/
│   │   ├── ui/              # shadcn/ui components (NO son dependencias npm — se copian aquí)
│   │   ├── events/          # EventCard, EventForm, etc.
│   │   ├── registrations/
│   │   ├── analytics/       # Charts, KPI cards
│   │   ├── landing/         # LandingPage, LogoMark, HubSpotRegisterForm (público)
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
│   └── styles/              # globals.css + landing.module.css (CSS Module scope-ado)
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

## Roles de Usuario y Permisos

El backend maneja 4 roles jerárquicos — el frontend debe respetar las restricciones de UI:

| Rol | Descripción | Acceso frontend |
|---|---|---|
| `super_admin` | Staff de Catalysis | Acceso completo (panel admin) |
| `tenant_admin` | Admin de la organización | Todas las páginas de gestión |
| `organizer` | Organizador de eventos | Gestión de eventos (no invitations) |
| `checkin_staff` | Staff de check-in | Solo `/events/[id]/checkin` |

**Jerarquía de permisos en API** (backend `IsCheckInStaffOrAbove`):
`checkin_staff` < `organizer` < `tenant_admin` < `super_admin`

**URL pública del evento**: formato `{slug}-{event_uuid}` → `/e/[slug]-[event_uuid]`.
El UUID al final permite lookup cross-tenant por ID sin recorrer slugs.

---

## Tipos TypeScript (src/types/index.ts)

Tipos implementados:
- `User` (incluye campo `role`: `'super_admin' | 'tenant_admin' | 'organizer' | 'checkin_staff'`), `Tenant`
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
| `/` | Landing de marketing + form de lead capture (HubSpot + Turnstile) |
| `/e/[slug]-[event_uuid]` | Página pública del evento + formulario de registro con campos dinámicos |
| `/aviso-de-privacidad` | Aviso de privacidad (placeholder — pendiente de contenido legal) |

### API Routes (server-side, Next.js)
| Ruta | Descripción |
|---|---|
| `POST /api/hubspot/register` | Verifica Turnstile + crea contacto/empresa/asociación en HubSpot CRM |

---

## Variables de Entorno (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000   # En producción Vercel: https://api.eventsync.cloud
NEXT_PUBLIC_APP_URL=http://localhost:3000   # En producción Vercel: https://eventsync.cloud

# Firebase Storage (imágenes hero de eventos)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# HubSpot CRM (server-only — nunca al cliente, sin prefijo NEXT_PUBLIC_)
HUBSPOT_PRIVATE_APP_TOKEN=

# Cloudflare Turnstile (CAPTCHA invisible en la landing pública)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=    # se inyecta al bundle del cliente
TURNSTILE_SECRET_KEY=              # solo server-side
```

**Setup de HubSpot** (única vez):
- Token: `app.hubspot.com` → Settings → Integrations → Private Apps → Auth tab → token `pat-na1-...`
- Scopes mínimos: `crm.objects.contacts.write`, `crm.objects.companies.write`, `crm.objects.associations.write`
- Custom properties requeridas (crear en HubSpot antes de enviar el primer form):
  - Contact: `acuerdodeprivacidad` (boolean / single checkbox)
  - Contact: `unidaddenegocio` (single-line text) — se inyecta server-side con valor fijo `Event-Sync`, no se expone en el form al cliente
  - Company: `crm_que_usas` (single-line text o dropdown)

**Setup de Turnstile** (única vez):
- Site Key + Secret Key: `dash.cloudflare.com` → Turnstile → Add Site → tipo Managed
- Hostnames permitidos: `eventsync.cloud` (prod) + `localhost` (dev)

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

### Vercel — Variables de entorno en build time

`NEXT_PUBLIC_*` se inyectan **en tiempo de build**, no en runtime. Después de agregar o cambiar una variable en el dashboard de Vercel, es obligatorio hacer **Redeploy** para que tome efecto. Vercel auto-redeploya cuando hay un push a `main`, lo que también aplica las nuevas variables.

**Variables configuradas en Vercel (producción)**:
- `NEXT_PUBLIC_API_URL=https://api.eventsync.cloud`
- `HUBSPOT_PRIVATE_APP_TOKEN` (server-only)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (build-time)
- `TURNSTILE_SECRET_KEY` (server-only)

### verify-email — token ya consumido

Cuando el token de verificación ya fue usado, el backend retorna error "Token inválido". El frontend muestra el error pero también un botón "Ir al login" porque el usuario puede estar ya verificado. El token se consume en el primer llamado exitoso — no es posible verificar dos veces con el mismo token.

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

### Landing pública — CSS Modules, Geist y API Route

La landing en `/` introdujo varios patrones nuevos al proyecto. Notas críticas:

**CSS Modules** (`src/styles/landing.module.css`, primero del repo):
- Variables CSS de la landing (`--p`, `--fg`, etc.) se definen sobre la clase wrapper `.landingRoot`, **no en `:root`**. Razón: el selector `:root` en CSS Modules se queda global y contamina shadcn/ui.
- Next.js rechaza selectores "no puros" como `:global(html)` en módulos — todo selector debe contener al menos una clase/id local. Si necesitas estilos globales (smooth scroll, etc.), van en `globals.css`, no en el módulo.
- En selectores combinados como `.hcardRowVal.blue` o `.dcolHead.them`, ambas clases se exportan automáticamente. En JSX se aplican concatenadas: `` className={`${styles.hcardRowVal} ${styles.blue}`} ``.

**Geist font**:
- En Next.js 14.2.3, `Geist` **NO está exportado** desde `next/font/google` aún. Usar el paquete dedicado `geist`:
  ```ts
  import { GeistSans } from 'geist/font/sans'
  // <div className={GeistSans.className}>
  ```
- Aplicar Geist solo al wrapper de la landing, **no a `<body>`**, para no interferir con Inter (fuente global del resto de la app).

**API Routes (`src/app/api/`)**:
- Primera API route del proyecto. El backend principal sigue siendo Django (`api.eventsync.cloud`); las API routes de Next.js se usan **solo cuando hay que proteger un secret server-side** (caso HubSpot token).
- **Forms públicos NO usan `apiClient`** (Axios + JWT auto). Usan `fetch` nativo a la API route directamente. `apiClient` está reservado para llamadas autenticadas al backend Django.
- Variables sin prefijo `NEXT_PUBLIC_` (`HUBSPOT_PRIVATE_APP_TOKEN`, `TURNSTILE_SECRET_KEY`) **nunca llegan al bundle del cliente** — solo las lee `route.ts` que corre en el server. Verificable con `grep -r "HUBSPOT_PRIVATE_APP_TOKEN" .next/static/` tras `npm run build`.

**HubSpot custom properties**:
- El form envía 3 propiedades custom (`acuerdodeprivacidad` y `unidaddenegocio` en Contact, `crm_que_usas` en Company). **Deben existir en HubSpot antes del primer submit** o el endpoint devolverá 502 con `PROPERTY_DOESNT_EXIST`.
- `unidaddenegocio` se setea server-side como constante `BUSINESS_UNIT = 'Event-Sync'` en `route.ts` y **no forma parte de `RegisterPayload`** — esto es intencional: evita que un cliente manipule el valor desde DevTools, y deja el contrato del tipo explícito sobre qué campos viajan en el body. Si en el futuro otro producto comparte este endpoint, mover la constante a env var (`HUBSPOT_BUSINESS_UNIT`).
- En 409 (contacto duplicado), el route continúa creando la empresa pero **omite la asociación** (no tenemos el `contactId` del contacto existente). El submit aparece exitoso al usuario pero solo se crea empresa nueva. Para upsert real, usar `/crm/objects/2026-03/contacts/batch/upsert` con `idProperty: 'email'`.
- Logs server-side aparecen en Vercel → Deployments → Functions → `/api/hubspot/register` → Logs.

**Cloudflare Turnstile**:
- Tokens son **single-use**: tras el primer `siteverify` server-side, Cloudflare invalida el token. Si el submit falla y el usuario reintenta, hay que llamar `turnstileRef.current?.reset()` para emitir uno fresco — ya implementado en `HubSpotRegisterForm.tsx`.
- El siteKey debe tener registrado el hostname desde donde se sirve. Para dev local agregar `localhost` en "Hostname Management" del site en Cloudflare, o usar las testing keys (`1x00000000000000000000AA`).

### Patrones de layout responsive (móvil)

Reglas recurrentes para evitar overflow en móvil:

**1. Headers con botones de acción**

Cuando un header tiene título a la izquierda y botones a la derecha, en móvil los botones se salen del contenedor. Solución: apilar verticalmente en móvil y volver a fila en `sm:`.

```tsx
// Contenedor del header
<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">

// Grupo de botones (flex-wrap en lugar de shrink-0)
<div className="flex items-center gap-2 flex-wrap">
```

**2. Filas flex con texto truncado**

Cuando una fila flex tiene texto con `truncate` + `min-w-0` pero el texto no se trunca en móvil, falta acotar el ancho del contenedor flex padre. Solución: agregar `w-full overflow-hidden` al elemento flex.

```tsx
<Link className="flex items-center ... w-full overflow-hidden">
  <div className="min-w-0">
    <p className="truncate">{title}</p>  {/* ahora sí trunca */}
  </div>
  <div className="shrink-0">...</div>
</Link>
```

**Regla general**: `truncate` solo funciona si todos sus ancestros flex tienen `min-w-0` y el contenedor raíz tiene un ancho acotado (`w-full` + `overflow-hidden`).

---

### Sidebar responsive — drawer en móvil

El sidebar usa un patrón **slot en desktop / drawer en móvil**:

- **Desktop (`md:`)**: posición relativa en el flujo normal, siempre visible
- **Móvil**: `fixed inset-y-0 left-0 z-50` con `transition-transform`. Oculto con `-translate-x-full`, visible con `translate-x-0`
- **Estado**: `isSidebarOpen` vive en `(auth)/layout.tsx` (padre común de `Sidebar` y `Navbar`)
- **Backdrop**: overlay `fixed inset-0 z-40 bg-black/50` renderizado en el layout cuando el drawer está abierto. `z-40` < `z-50` del sidebar para que quede detrás
- **Cierre**: botón X dentro del sidebar, clic en el backdrop, o navegación a cualquier link del menú

**Props agregadas**:
- `Sidebar`: `isOpen: boolean`, `onClose: () => void`
- `Navbar`: `onMenuClick: () => void` — muestra botón hamburger (`Menu` de lucide) solo en móvil (`md:hidden`)

**Regla**: no usar `display:none` para ocultar el sidebar en móvil — usar `translate` para preservar la animación de entrada/salida.

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

**Última actualización**: 2026-05-02
**Versión**: 1.2.1 — atribución `unidaddenegocio=Event-Sync` server-side en Contact de HubSpot
