# 📌 Estado del Proyecto — ConstruApp Nariño

> Última actualización: 2026-09-26
> Este documento describe el estado **real y verificado** del repositorio para
> poder continuar el desarrollo desde aquí.

---

## ✅ Resumen ejecutivo

El monorepo **instala, compila y arranca sin errores**. Se resolvió el bloqueo
de gestor de paquetes (pnpm no disponible), se alinearon todas las dependencias
incompatibles y se completaron los archivos que faltaban para que cada workspace
compile en TypeScript.

| Área | Estado | Comando de verificación |
|------|--------|-------------------------|
| Instalación | ✅ `npm install` sin conflictos, idempotente | `npm install` |
| Type-check | ✅ 0 errores (backend + frontend + mobile) | `npm run typecheck` |
| Build | ✅ 3 workspaces (mobile = `expo export`) | `npm run build` |
| Lint | ✅ 0 errores / 0 warnings (3 workspaces) | `npm run lint` |
| Tests | ✅ backend 115 (12 suites) + frontend 5 (vitest); mobile sin tests | `npm test` |
| Backend dev server | ✅ responde en `/api/health` | `npm run dev:backend` |
| **Backend ↔ PostgreSQL + Redis** | ✅ `database: connected` / `cache: connected` | `docker compose up -d postgres redis` + `curl :5000/api/status` |
| **Migraciones + seed** | ✅ 7 tablas + catálogo de Nariño (3 proveedores, 8 materiales, 24 precios) | `npm run migrate/seed --workspace=construapp-backend` |
| Frontend dev server | ✅ sirve en `:3000` | `npm run dev:frontend` |
| Mobile (Expo SDK 50) | ✅ `expo-doctor` 16/16, `tsc` limpio, Metro arranca | `npm run dev:mobile` |

---

## 🔧 Qué se cambió y por qué

### 0. Capa de datos del backend + arranque real (última sesión)

- **`src/config/database.ts`** — instancia Sequelize desde `.env`
  (`DB_DIALECT=postgres` por defecto; `sqlite` como alternativa sin infra).
  `connectDatabase()` no bloquea el arranque: si falla, el servidor sigue y
  `/api/status` muestra `database: "disconnected"`.
- **`src/config/redis.ts`** — cliente Redis; la caché es opcional, no bloquea.
- **`src/models/index.ts`** — 7 modelos Sequelize con asociaciones
  (`User`, `Provider`, `Material`, `MaterialPrice`, `Project`,
  `ProjectCalculation`, `CalculatorType`) según `ARCHITECTURE.md`.
- **`src/migrations/0001-initial.migration.ts`** — crea todas las tablas
  (sync de modelos para la primera migración; las siguientes deben ser DDL).
- **`src/seeds/0001-catalogo-narino.seed.ts`** — 3 tipos de calculadora,
  8 materiales, 3 proveedores demo de Nariño y 24 precios en COP. Idempotente.
- `index.ts` conecta a BD y Redis al arrancar; `/api/status` reporta el estado real.
- **Puertos Docker cambiados a `5433` (Postgres) y `6380` (Redis)** para no
  chocar con un PostgreSQL 17 local que ocupa el `5432`. `backend/.env` ya usa
  esos puertos; configurables con `DB_HOST_PORT` / `REDIS_HOST_PORT`.
- **Aviso `DEP0180` de ts-node eliminado** con `--disable-warning=DEP0180` en
  los scripts `dev` / `migrate` / `seed` (se descartó `tsx` por un conflicto de
  versión de `esbuild` con Vite en el workspace).
- Añadido `pg-hstore` (peer de Sequelize para Postgres) y `sqlite3` como
  `optionalDependencies` (habilita `DB_DIALECT=sqlite` sin infraestructura).
- Los runners `migrate` / `seed` ahora imprimen el error real con `console.error`
  (antes Winston no lo alcanzaba a vaciar antes de `process.exit`).

Verificado en vivo: `docker compose up -d postgres redis` → `npm run migrate` crea
las 7 tablas → `npm run seed` carga el catálogo → backend en `:5000` con
`/api/status` = `{"database":"connected","cache":"connected"}`. El mismo flujo
funciona con `DB_DIALECT=sqlite` (archivo `backend/data/construapp.sqlite`).

**Cómo levantar el stack completo:**
```bash
docker compose up -d postgres redis
npm run migrate --workspace=construapp-backend
npm run seed    --workspace=construapp-backend
npm run dev            # backend :5000 + frontend :3000 + mobile
```

### 1. Gestor de paquetes: pnpm → **npm workspaces**

**Causa raíz del bloqueo:** el repo estaba configurado para `pnpm` (scripts raíz,
Dockerfiles, `pnpm-workspace.yaml`, docs) pero `pnpm` no está instalado y
`corepack` no puede descargarlo en este entorno. Al mismo tiempo ya existía
`package-lock.json` y `node_modules` de npm.

**Solución:**
- `package.json` raíz: `workspaces` + `packageManager: "npm@11.6.0"`; scripts
  reescritos a `npm run <script> --workspaces --if-present` (+ atajos
  `dev:backend`, `dev:frontend`, `dev:mobile`).
- Eliminado `pnpm-workspace.yaml` y la devDependency `pnpm`.
- `package-lock.json` ahora **se versiona** (se quitó de `.gitignore`).
- Dockerfiles de backend y frontend reescritos a `npm ci` con contexto en la
  raíz del repo; `docker-compose.yml` ajustado (`context: .`, rutas y nombre de
  BD sin `ñ`, se quitó `version:` obsoleta).
- Docs (`README`, `QUICKSTART`, `SETUP`, `CONTRIBUTING`) actualizadas a npm.

### 2. Dependencias incompatibles resueltas

| Paquete | Antes | Ahora | Motivo |
|---------|-------|-------|--------|
| `expo-router` (mobile) | `^2.0.15` | `~3.4.10` | v2 exige `expo@^49`; el proyecto usa `expo@50` |
| `react` / `react-native` (mobile) | `^18.2.0` / `^0.73.0` | `18.2.0` / `0.73.6` | RN 0.73 fija exactamente `react@18.2.0` |
| `react` / `react-dom` (frontend) | `^18.2.0` (→ 18.3.1) | `18.2.0` | Deduplicar con mobile y evitar peer inválido de RN |
| `expo-file-system` | `~15.6.0` | `~16.0.9` | Versión de Expo SDK 50 |
| `react-native-screens` | `~3.27.0` | `~3.29.0` | Versión de Expo SDK 50 |
| `react-native-svg` | `13.14.0` | `14.1.0` | Versión de Expo SDK 50 |
| `react-native-reanimated` | `~3.6.0` | `~3.6.2` | Versión de Expo SDK 50 |
| `expo-splash-screen` | `~0.26.4` | `~0.26.5` | Versión de Expo SDK 50 |
| `expo-constants`, `expo-linking` | (faltaban) | `~15.4.6`, `~6.2.2` | Requeridos por expo-router 3 |
| `react-query` (frontend + mobile) | `^3.39.3` (EOL) | `@tanstack/react-query@^5` | v3 sin mantenimiento; API equivalente para este uso |
| `@types/cors` (backend) | (faltaba) | `^2.8.17` | `tsc` fallaba: "Could not find a declaration file for 'cors'" |
| `@types/react-native` (mobile) | `^0.73.0` | (eliminado) | RN 0.73 ya incluye sus propios tipos; el paquete está deprecado |
| `jsonwebtoken` (backend) | `^9.0.3` | `^9.0.2` | Normalizado a la última publicada estable |
| `minify` de Vite | `terser` | `esbuild` | Evita depender de `terser` (no declarado; era transitivo) |

**Override en `package.json` raíz:**
```json
"overrides": { "ajv-keywords": { "ajv": "8.20.0" } }
```
`expo-router → schema-utils → ajv-keywords@5` requería `ajv@8`, pero se resolvía
al `ajv@6` de ESLint. El override fuerza la versión correcta sin tocar ESLint.

### 3. Archivos que faltaban (creados)

**Backend**
- `src/migrations/run.ts` y `src/seeds/run.ts` — runners reales referenciados por
  los scripts `migrate` / `seed`. Escanean su carpeta por archivos
  `*.migration.ts` / `*.seed.ts` y los ejecutan en orden; hoy no hay ninguno,
  así que terminan sin cambios.
- `scripts/register-ts-node.js` — reemplaza el flag `--loader ts-node/esm`
  (deprecado) por `module.register` (API estable de Node ≥ 20.6).
- `jest.config.js` — preset `ts-jest` (transpila a CJS, sin flags experimentales).
- `.eslintrc.cjs` — no existía configuración de ESLint.
- `.env` — copia local de `.env.example` para `npm run dev`.
- `src/config/logger.ts` — ahora crea `backend/logs/` si no existe (evita
  ENOENT al arrancar).
- `tsconfig.json` — `module`/`moduleResolution` pasados de `node` (node10, en
  desuso) a `node16`; añadido `types: ["node"]`; quitado `baseUrl` (deprecado
  en TS 7) y los `paths` reescritos como `./src/...` autocontenidos.

**Frontend**
- `public/favicon.svg` — el `index.html` apuntaba a `/vite.svg` inexistente.
- `src/vite-env.d.ts` — faltaba el archivo estándar de Vite
  (`/// <reference types="vite/client" />`). Sin él, TypeScript 6+ marca
  `TS2882` en los imports de CSS (`import './App.css'`) y no reconoce
  `import.meta.env`.
- `.eslintrc.cjs`.
- `tsconfig.json` — quitado `baseUrl` (deprecado en TS 7); los `paths` ya eran
  `./src/...` y siguen funcionando (se resuelven relativos al tsconfig).
- `tsconfig.node.json` — la salida de `tsc -b` (proyecto compuesto para
  `vite.config.ts`) se redirige a `node_modules/.tmp/` para no generar
  `vite.config.js`/`.d.ts` sueltos; `types` acotado a `["node"]`.

> Nota: cuando el backend empiece a usar imports con alias (`@/...`), hay que
> registrar `tsconfig-paths` en `ts-node` (el runtime no resuelve `paths` solo).

**Mobile** (era solo `app.json` + `package.json`)
- `tsconfig.json` (extiende `expo/tsconfig.base`). Se sobrescribe
  `moduleResolution` a `Bundler` + `module` a `ESNext`: el base de Expo SDK 50
  trae `"moduleResolution": "node"` (node10), en desuso y marcado como error por
  TypeScript 6/7. Es el mismo criterio que ya usa el base de Expo SDK 51+.
- `babel.config.js` (`babel-preset-expo` + plugin de reanimated).
- `expo-env.d.ts`.
- `app/_layout.tsx` y `app/index.tsx` — layout raíz de expo-router con
  `QueryClientProvider`, `SafeAreaProvider`, `GestureHandlerRootView` y una
  pantalla de inicio. Es la "base móvil" de la Fase 1.5 del roadmap.
- `.eslintrc.cjs`.
- `app.json` saneado: `slug`/`bundleIdentifier`/`package` sin `ñ` (inválido en
  stores), se quitaron referencias a assets inexistentes (`icon.png`, etc.).

---

## 📂 Estado por workspace

### backend/ (`construapp-backend`) — EP-00·01·02·03·12 ✅
- Express + Helmet + CORS + rate-limit + Winston (silencioso en test).
  `GET /`, `GET /api/health`, `GET /api/status`.
- ✅ **PostgreSQL + Redis** (`config/database.ts`, `config/redis.ts`), arranque
  resiliente, apagado ordenado.
- ✅ **8 modelos Sequelize** (`models/index.ts`, incluye `RefreshToken`) +
  migración inicial (`+ down`) + seed.
- ✅ **Middleware**: `validate.ts` (Joi), `errorHandler.ts` (+ `notFoundHandler`),
  `auth.ts` (`requireAuth` / `requireRole`), `utils/{ApiError,tokens,asyncHandler}.ts`.
- ✅ **Autenticación** (`services/authService.ts`, `routes/auth.ts`):
  `/api/auth/register|login|refresh|logout|me|change-password`. JWT + refresh
  token con rotación y detección de reúso.
- ✅ **Motor de cálculo** (`calculatorService` + `priceService` +
  `utils/dosifications.ts`): `GET /api/calculators/types`,
  `POST /api/calculators/concrete|brick|mortar` — desglose y costo en COP con el
  proveedor más barato. Rutas públicas.
- ✅ **Proyectos y presupuestos** (`services/projectService.ts`): CRUD de
  `/api/projects`, `POST|DELETE /:id/calculations`, `summary` de presupuesto
  acumulado vs objetivo, guardar cálculo recalcula en servidor (HU-02.8),
  aislado por usuario.
- ✅ **Back-office** (`services/adminService.ts`, `routes/admin.ts`,
  solo rol `admin`): CRUD de materiales (baja lógica), CRUD de proveedores,
  `PUT /api/admin/prices` (upsert por material+proveedor), `GET /api/admin/users`
  + `PATCH /api/admin/users/:id/status` (suspender/reactivar). Seed opcional
  `0002-admin.seed.ts` desde `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
- ✅ **Fechas de proyecto** (`startDate`/`endDate`, `DATEONLY`): el esquema Joi las
  valida pero conserva el texto `YYYY-MM-DD` (`.raw()`); antes se convertían a
  `Date` y se guardaban un día antes en la zona horaria de Colombia. La fecha de
  fin ya no exige fecha de inicio.
- ✅ **8 calculadoras** (2026-10-19): hormigón, cimiento ciclópeo, acero de refuerzo
  (malla de placa), mampostería, muro en bloque, mortero, piso/enchape y pintura.
  Fórmulas aproximadas en `utils/dosifications.ts`; rutas generadas desde
  `CALCULATOR_IDS` (`schemas/calculatorSchemas.ts`). El catálogo del seed pasa a 13
  materiales y 39 precios (alambre negro, baldosa, pegante, boquilla, piedra rajón).
- ✅ **Elección de material y cubierta** (2026-10-19): resistencia del hormigón,
  proporción del mortero, pieza de arcilla, bloque n.º 4/6, diámetro de varilla,
  tipo de pintura y de piso (tablas `*_MIXES`/`*_TYPES` en `utils/dosifications.ts`;
  `priceService` acepta un `material` por ítem). Nueva calculadora `roof` (teja de
  fibrocemento o zinc + ganchos). Catálogo del seed: **33 materiales, 99 precios**.
- ✅ **EP-04 catálogo público**: `GET /api/materials`, `GET /api/providers` (filtros
  por material, categoría, ubicación y calificación; oculta proveedores sin precios)
  y `GET /api/providers/:id` (`services/catalogService.ts`, `routes/catalog.ts`).
- ✅ **115 pruebas backend** (jest + supertest), 12 suites; **5 frontend** (vitest).
- EP-04 cubierto salvo filtros avanzados del directorio en el frontend por material concreto.
- `npm run build` genera `dist/`.

### frontend/ (`construapp-frontend`)
- React 18 + Vite 5 + React Router 6 + Tailwind 3 + `@tanstack/react-query` v5.
- ✅ **Interfaz rediseñada (2026-10-13)** — sistema de diseño propio:
  - **Tokens semánticos** de color como variables CSS en `src/index.css`, expuestos
    en `tailwind.config.js` (`bg-surface`, `text-ink-muted`, `border-line`,
    `bg-brand`…). Usar siempre estos tokens, no la paleta cruda de Tailwind: así
    el **tema oscuro** (clase `dark` en `<html>`, `hooks/useTheme.ts`, selector en
    `components/ThemeToggle.tsx`) funciona sin más. Pares texto/fondo en AA.
  - **Tipografía autoalojada** (`@fontsource`): Barlow (texto y cifras) y Barlow
    Condensed (títulos). **Iconos**: Phosphor vía `react-icons/pi`.
  - **Componentes base** en `components/ui/` (`Button`, `Field`, `Modal`,
    `ConfirmDialog`, `Badge`, `Alert`, `Meter`, `StatTile`, `EmptyState`,
    `Skeleton`, `SegmentedControl`, `PageHeader`); diálogos, pestañas y menús
    accesibles con `@headlessui/react`; formularios con `@tailwindcss/forms`.
  - **Navegación adaptable** (`components/Layout.tsx`): barra lateral en
    escritorio; barra superior + barra de pestañas inferior en móvil.
  - Portada pública, pantallas de acceso con panel de marca
    (`components/AuthLayout.tsx`), panel de inicio con cifras de los proyectos,
    croquis acotado en las calculadoras (`components/calculators/CalculatorSketch.tsx`)
    y página 404. La calculadora activa viaja en la URL (`/calculators?tipo=brick`).
  - Selector de calculadoras agrupado por etapa (Estructura, Muros, Acabados) y
    **lista de compra** en el detalle de cada proyecto
    (`components/projects/PurchaseList.tsx`): suma los materiales de todos sus
    cálculos, con opción de imprimir (la navegación se oculta al imprimir).
  - **Proveedores y precios** (`pages/Providers.tsx`, `pages/ProviderDetail.tsx`, públicas):
    buscador de materiales con el precio más bajo y la comparación por proveedor,
    directorio con filtros por ubicación, tipo de material y calificación, y ficha
    de cada proveedor con todos sus precios. Las calculadoras muestran un selector
    cuando se puede elegir el material.
- ✅ **Autenticación funcional**: `services/api.ts` (axios + interceptor de
  refresh transparente), `services/auth.ts`, `context/AuthContext.tsx`,
  `hooks/useAuth.ts`, `components/ProtectedRoute.tsx`. `Login` / `Register` con
  `react-hook-form` + `zod`; `Layout` con logout; `Dashboard` con datos del
  usuario. **Se puede iniciar sesión y navegar** las rutas privadas; sin sesión
  redirige a `/login` y vuelve a la URL original.
- ✅ **Vitest configurado** (`vite.config.ts` → `test`, `jsdom`, `src/test/setup.ts`):
  primeras pruebas (`ProtectedRoute.test.tsx`, `AuthContext.test.tsx`).
- ✅ **Calculadoras funcionales** (`services/calculators.ts`, `services/projects.ts`,
  `utils/format.ts`, `components/calculators/*`, `pages/Calculators.tsx`):
  pestañas Hormigón/Mampostería/Mortero con formulario validado (`zod`), tabla
  de resultado con precio y proveedor, y guardado en un proyecto. **`/calculators`
  es pública** (HU-02.10; se sacó de `<ProtectedRoute>`); `Layout` muestra
  "Iniciar sesión" cuando no hay usuario.
- ✅ **Proyectos funcionales** (`services/projects.ts`, `components/projects/*`,
  `pages/{Projects,ProjectDetail}.tsx`): lista con react-query y filtro por estado, alta en
  un diálogo, tarjetas con `StatusBadge` + `BudgetSummary`, detalle con
  cambio de estado, edición, eliminación (con confirmación) y tabla de cálculos
  con detalle desplegable y borrado por fila. Ruta `/projects/:projectId` dentro de `<ProtectedRoute>`.
  Verificado end-to-end en navegador con Puppeteer.
- ✅ **Panel de administración funcional** (`services/admin.ts`,
  `components/AdminRoute.tsx`, `pages/Admin/{AdminLayout,Materials,Providers,
  Prices,Users}.tsx`): CRUD de materiales (con baja/reactivación), CRUD de
  proveedores, alta/baja de precios por proveedor con filtros, listado de
  usuarios con búsqueda (debounce 300ms) y suspender/reactivar cuentas. Rutas
  `/admin/*` protegidas por `<AdminRoute>` (exige sesión y rol `admin`); el
  enlace "Administración" de la navegación solo aparece para administradores. Verificado
  end-to-end en navegador con Puppeteer, incluida la denegación de acceso a un
  usuario no-admin y el bloqueo de login tras suspender una cuenta.
- **Falta**: la pantalla de perfil.

### mobile/ (`construapp-mobile`)
- Expo SDK 50 + expo-router 3. Arranca el bundler; pantalla de inicio informativa.
- **No** hay todavía: pantallas de calculadoras/auth, navegación por tabs,
  persistencia offline (expo-sqlite), sincronización.

---

## ⚠️ Deuda técnica / cosas a saber

- **`npm audit`**: ~65 advertencias, todas en dependencias **transitivas de
  tooling** (cadena de build de Expo/Metro, `sequelize → uuid`, esbuild viejo…).
  `npm audit fix` no cambia nada y `npm audit fix --force` rompería la alineación
  con Expo SDK 50. Se revisará al subir de versión de Expo. No hay superficie de
  ataque real: la app aún no expone lógica de datos/red.
- **`react-toastify`** sigue declarado en el frontend pero no se usa (la app usa
  `react-hot-toast`). Se puede eliminar cuando se decida la librería de toasts.
- **No es un repositorio Git todavía.** Cuando se inicialice: `git init`, y el
  primer commit ya puede incluir `package-lock.json`.
- `ts-node` emite `DeprecationWarning: fs.Stats constructor is deprecated` en
  Node 22 al correr `migrate`/`seed`/`dev`. Es inofensivo (interno de ts-node).
- Los `tsconfig.json` están saneados para **TypeScript 6/7** (sin `baseUrl`, sin
  `moduleResolution: node10`). Verificado con `typescript@6.0.0-beta`. Si el
  editor sigue mostrando el error de `baseUrl` tras estos cambios, es una
  diagnóstico obsoleto: reiniciar el servidor de TypeScript de VS Code
  (`Ctrl+Shift+P` → «TypeScript: Restart TS Server»).
- `DEPLOYMENT.md` creado con lo mínimo (Docker); ampliar al definir hosting.

---

## ▶️ Próximos pasos sugeridos (Fase 1 — MVP)

> Backlog detallado en [`HISTORIAS-DE-USUARIO.md`](./HISTORIAS-DE-USUARIO.md).
> Checklist de avance en [`PROGRESO-MVP.md`](./PROGRESO-MVP.md).

Orden recomendado, alineado con `docs/ROADMAP.md` y `docs/API.md`:

1. ~~**EP-00 — Fundación técnica**~~ ✅ **COMPLETA** (HU-00.1 … HU-00.5).
   Las migraciones siguientes deben ser DDL explícito (`queryInterface`).
2. ~~**EP-01 — Autenticación**~~ ✅ **COMPLETA** (HU-01.1-01.7, backend + frontend).
   Recuperación de contraseña: sin SMTP el enlace se escribe en el log del backend.
3. ~~**EP-02 — Motor de cálculo**~~ ✅ **COMPLETA** (HU-02.1-02.8, 02.10; backend + frontend).
   Falta HU-02.9 (comparativa), 02.11, 02.12.
4. ~~**EP-03 — Proyectos y presupuestos**~~ ✅ **COMPLETA** (HU-03.1-03.7 + HU-02.8, backend + frontend).
5. ~~**EP-12 — Back-office**~~ ✅ **COMPLETA** (HU-12.1-12.3, backend + frontend).
   `adminService` + `pages/Admin/*`, rutas `/api/admin/*` y `/admin/*` (rol `admin`).
6. **EP-04 — Proveedores públicos** (`/api/providers*`): listar, ficha, precios
   (backend + frontend). ← **siguiente**
7. **Mobile** (Fase 1.5): pantallas de calculadora y auth reutilizando el cliente API.
8. **CI**: `.github/workflows/` (lint + typecheck + test + build). *(pendiente)*

---

## 🧭 Comandos de referencia

```bash
npm install              # instala TODO el monorepo (una vez, desde la raíz)
npm run dev              # backend + frontend + mobile en paralelo
npm run dev:backend     # solo API  (http://localhost:5000)
npm run dev:frontend    # solo web  (http://localhost:3000)
npm run dev:mobile      # solo Expo
npm run typecheck       # tsc --noEmit en los 3 workspaces
npm run build           # build de backend y frontend
npm run lint            # ESLint en los 3 workspaces
npm test                # tests en los 3 workspaces
npm run migrate --workspace=construapp-backend
npm run seed    --workspace=construapp-backend
```
