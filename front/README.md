# Nexo Frontend

React PWA para Nexo v1. Mobile-first, multi-rol (Admin/Operator), conectado al backend NestJS via httpOnly cookies.

## Stack

| Dependencia | Propósito |
|-------------|-----------|
| React 19 | UI |
| React Router 7 | Navegación SPA con guards de rol |
| Zustand 5 | Estado global (auth store) |
| TanStack Query 5 | Data fetching, caching, auto-refresh |
| React Hook Form + Zod | Validación de formularios |
| Lucide React | Iconos SVG ligeros |
| Vite 7 | Bundler + dev server |

## Estructura

```
src/
  main.tsx              # Bootstrap
  App.tsx               # QueryClient + AuthInitializer + Router
  routes.tsx            # Configuración de React Router
  styles.css            # CSS vanilla con variables
  vite-env.d.ts         # Tipos Vite
  stores/
    auth-store.ts       # Zustand: login, logout, checkSession
  lib/
    api-client.ts       # Fetch wrapper con auto-refresh JWT
  auth/
    access.ts           # Roles, navegación, permisos
  components/
    layout/
      AppShell.tsx      # Sidebar + Header + MobileNav + Content
      Sidebar.tsx       # Navegación lateral con iconos
      Header.tsx        # Barra superior con título dinámico
      MobileNav.tsx     # Barra inferior móvil (≤760px)
  features/
    auth/
      LoginPage.tsx     # Formulario de login
      AuthGuard.tsx     # Protección de rutas por sesión y rol
```

## Rutas

| Ruta | Rol | Descripción |
|------|-----|-------------|
| `/login` | — | Login |
| `/` | Operator, Admin | Captura (placeholder) |
| `/inventory` | Operator, Admin | Inventario (placeholder) |
| `/admin/catalogs` | Admin | Catálogos (placeholder) |
| `/admin/users` | Admin | Usuarios (placeholder) |
| `/admin/reports` | Admin | Reportes (placeholder) |
| `/admin/corrections` | Admin | Correcciones (placeholder) |

Los placeholders serán reemplazados por las pantallas reales según avancen las features F2-F11.

## Desarrollo

```bash
npm run dev       # Vite dev server con proxy /api → localhost:3000
npm run build     # TypeScript + Vite build
npm run test      # Vitest
```

## Auth Flow

1. App carga → `checkSession()` llama `GET /auth/me`
2. Si hay cookie JWT válida → muestra app shell
3. Si no → redirige a `/login`
4. Login → `POST /auth/login` → backend setea cookies httpOnly → store actualiza
5. 401 en cualquier request → `api-client` auto-refresca via `POST /auth/refresh`
6. Si refresh falla → limpia sesión → redirige a `/login`
7. Logout → `POST /auth/logout` → limpia cookies → redirige a `/login`
