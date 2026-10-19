# ✅ Progreso del MVP — ConstruApp Nariño

> Checklist vivo de las historias de [`HISTORIAS-DE-USUARIO.md`](./HISTORIAS-DE-USUARIO.md).
> `✅` hecha y verificada · `🔨` en progreso · `🟡` parcial · `❌` sin empezar.
> Última actualización: 2026-09-26.

## EP-00 · Fundación técnica — ✅ COMPLETA

> *Preparación del entorno, capa de datos base con modelos y migraciones,
> middleware, y conexión a PostgreSQL y Redis.*

| HU | Historia | Estado | Notas |
|----|----------|:---:|-------|
| HU-00.1 | Monorepo compila sin errores | ✅ | `npm install` idempotente y sin conflictos; `typecheck` + `lint` + `build` + `test` en verde en **los 3 workspaces** (se añadió `build` a mobile = `expo export`). |
| HU-00.2 | Conexión PostgreSQL / Redis desde `.env` | ✅ | `config/database.ts` + `config/redis.ts`, arranque resiliente, apagado ordenado. Ver detalle abajo. |
| HU-00.3 | Modelos Sequelize + migración inicial | ✅ | 7 modelos en `models/index.ts` + `0001-initial.migration.ts` + `down()`. Verificado con pruebas (SQLite en memoria): crea las 7 tablas, es idempotente, registra las asociaciones. |
| HU-00.4 | Middleware de validación (Joi) + manejo de errores | ✅ | `middleware/validate.ts` (Joi), `middleware/errorHandler.ts` (+ `notFoundHandler`), `utils/ApiError.ts`. Respuestas uniformes `{error,status,details?}`. 10 pruebas. |
| HU-00.5 | Seed de proveedores/materiales de Nariño | ✅ | `0001-catalogo-narino.seed.ts` (3 calc, 8 materiales, 3 proveedores, 24 precios). |

## EP-01 · Autenticación — ✅ COMPLETA (backend)

> *Registro, inicio de sesión, refresh token con rotación, rutas protegidas y
> gestión de perfil.*

| HU | Historia | Estado |
|----|----------|:---:|
| HU-01.1 | Registro con correo/contraseña + tipo de perfil | ✅ (backend) |
| HU-01.2 | Iniciar sesión | ✅ backend + **frontend** |
| HU-01.3 | Refresh token con rotación | ✅ backend + **frontend** |
| HU-01.4 | Rutas protegidas | ✅ backend + **frontend** |
| HU-01.5 | Cerrar sesión | ✅ backend + **frontend** |
| HU-01.6 | Recuperar contraseña | ✅ backend + **frontend** |
| HU-01.7 | Editar perfil / cambiar contraseña | ✅ backend (falta pantalla) |

**Frontend de autenticación ✅**: `services/api.ts` (axios + interceptor de refresh
transparente + `tokenStore` en localStorage), `services/auth.ts`, `context/AuthContext.tsx`,
`hooks/useAuth.ts`, `components/ProtectedRoute.tsx`. Formularios reales de
**Login** y **Register** (`react-hook-form` + `zod`), `Layout` con logout y nombre
de usuario, `Dashboard` con datos del usuario. Verificado en navegador: login de
`demo@` y `admin@` → `/dashboard`; ruta privada sin sesión → `/login`.

Pendiente: pantalla de perfil / cambio de contraseña (HU-01.7 UI).

## EP-02 · Motor de cálculo — ✅ COMPLETA (backend + frontend funcional)

> *Calculadoras de hormigón, ladrillo y mortero con desglose de materiales y
> costo estimado con precios locales.*

| HU | Historia | Estado |
|----|----------|:---:|
| HU-02.1 | Listar calculadoras con sus campos | ✅ backend + **frontend** (pestañas) |
| HU-02.2 | Calcular hormigón (volumen + cemento/arena/grava) | ✅ backend + **frontend** |
| HU-02.3 | Calcular ladrillos + mortero de muro | ✅ backend + **frontend** |
| HU-02.4 | Calcular mortero de pega/revoque | ✅ backend + **frontend** |
| HU-02.5 | Desglose + costo en COP con precios locales (proveedor más barato) | ✅ backend + **frontend** (tabla de resultado) |
| HU-02.6 | Validación de entradas (positivas, obligatorias) | ✅ backend + **frontend** (`zod`) |
| HU-02.7 | Ajustar % de desperdicio | ✅ backend + **frontend** (campo `wastePct`, por defecto 5) |
| HU-02.8 | Guardar cálculo en un proyecto | ✅ backend + **frontend** (selector de proyecto en el resultado) |
| HU-02.9 | Comparar precios entre proveedores en el resultado | 🟡 — hoy se elige el más barato; falta exponer la comparativa |
| HU-02.10 | Usar la calculadora sin registrarse | ✅ backend + **frontend** (`/calculators` es pública) |
| HU-02.11 | Modo avanzado de dosificaciones | ❌ |
| HU-02.12 | Calculadora de pintura | ❌ |

### Frontend de EP-02 — ✅

`services/calculators.ts`, `services/projects.ts` (para el selector de guardado),
`utils/format.ts` (COP y cantidades), `components/calculators/{CalculatorPanel,ResultPanel}.tsx`,
`pages/Calculators.tsx` (pestañas Hormigón/Mampostería/Mortero, formulario dinámico
por `fields`, tabla de resultado con proveedor y precio, aviso si falta un precio
en el catálogo). **`/calculators` se movió fuera de `<ProtectedRoute>`** (era
inconsistente con HU-02.10): usuarios sin sesión pueden calcular; guardar en un
proyecto pide iniciar sesión. `Layout` ahora muestra "Iniciar sesión" en vez de
"Salir" cuando no hay usuario. Verificado en navegador (invitado y con sesión,
incluida la persistencia real del cálculo en un proyecto).

## EP-03 · Proyectos y presupuestos — ✅ COMPLETA (backend + frontend)

> *Crear proyectos, guardar cálculos y ver el presupuesto acumulado frente al objetivo.*

| HU | Historia | Estado |
|----|----------|:---:|
| HU-03.1 | Crear proyecto (nombre, ubicación, presupuesto, fechas) | ✅ backend + **frontend** |
| HU-03.2 | Listar mis proyectos con estado y presupuesto | ✅ backend + **frontend** |
| HU-03.3 | Detalle del proyecto con sus cálculos | ✅ backend + **frontend** |
| HU-03.4 | Editar y eliminar proyecto | ✅ backend + **frontend** |
| HU-03.5 | Presupuesto acumulado vs objetivo (% consumido, diferencia) | ✅ backend + **frontend** (`summary`, barra de progreso) |
| HU-03.6 | Editar/eliminar un cálculo del proyecto | ✅ backend + **frontend** (`DELETE …/calculations/:id`) |
| HU-03.7 | Estados del proyecto (planning / in-progress / finished) | ✅ backend + **frontend** (`<select>` en el detalle) |
| HU-02.8 | Guardar un cálculo en el proyecto (recalculado en servidor) | ✅ backend + **frontend** |

### Frontend de EP-03 — ✅

`services/projects.ts` (`Project`, `BudgetSummary`, `ProjectCalculation`,
`CreateProjectInput`, `projectsApi`), `components/projects/{ProjectForm,EditProjectForm,
StatusBadge,BudgetSummary}.tsx`, `pages/Projects.tsx` (lista con react-query, alta
mediante formulario plegable, tarjetas con resumen de presupuesto), `pages/ProjectDetail.tsx`
(detalle, cambio de estado, edición, eliminación, tabla de cálculos con borrado por
fila). Ruta `/projects/:projectId` añadida dentro de `<ProtectedRoute>` en `App.tsx`.

Verificado en navegador con Puppeteer (usuario `demo@`): crear proyecto → aparece en
la lista con su resumen de presupuesto → abrir detalle → cambiar estado → editar
nombre/ubicación/presupuesto → guardar un cálculo desde `/calculators` en el
proyecto → ver el cálculo y el presupuesto actualizado (incluye el caso de
presupuesto superado, barra roja) → eliminar el cálculo → eliminar el proyecto
(con confirmación) → ya no aparece en la lista. De paso se corrigió una
invalidación de `react-query` en `ProjectDetail.tsx` que causaba un refetch
innecesario (404 en consola) del detalle justo antes de navegar tras borrar el
proyecto (`refetchType: 'none'` en esa invalidación puntual).

## EP-12 · Administración y back-office — ✅ COMPLETA (backend + frontend)

> *Carga manual del catálogo de materiales y de los precios por proveedor, y
> moderación de usuarios.*

| HU | Historia | Estado |
|----|----------|:---:|
| HU-12.1 | Administrar el catálogo de materiales (CRUD, baja lógica) | ✅ backend + **frontend** |
| HU-12.2 | Cargar y actualizar precios por material y proveedor | ✅ backend + **frontend** |
| HU-12.3 | Listar y suspender / reactivar usuarios | ✅ backend + **frontend** |

### Frontend de EP-12 — ✅

`services/admin.ts` (clientes tipados para `materials/providers/prices/users`),
`components/AdminRoute.tsx` (exige sesión **y** rol `admin`; sin sesión → `/login`,
con sesión pero sin rol → `/dashboard`), `pages/Admin/{AdminLayout,Materials,
Providers,Prices,Users}.tsx` (sub-navegación por pestañas, formularios de alta/edición
con `zod`, tablas con acciones). Rutas `/admin/{materials,prices,providers,users}`
dentro de `<AdminRoute>` en `App.tsx`; `Layout.tsx` muestra el enlace "Admin" solo
si `user.role === 'admin'`.

Verificado en navegador con Puppeteer: un usuario normal no ve el enlace "Admin" y
`/admin` lo redirige a `/dashboard`; como admin — crear/editar/desactivar un
material, crear/editar un proveedor, fijar y luego eliminar un precio, buscar y
suspender un usuario (que de inmediato no puede volver a iniciar sesión, `403`).

De paso se corrigieron tres problemas reales encontrados durante esta verificación:
- **`MaterialPrice.price` (DECIMAL) se serializaba como string** (`"74000.00"`) en
  vez de número — mismo defecto que ya se había corregido antes en `budget`/`totalCost`.
  Se añadió el mismo `toJSON()` override en el modelo (`backend/src/models/index.ts`).
- **El buscador de usuarios disparaba una petición por cada tecla** (`q` iba
  directo al `queryKey`). Se añadió *debounce* de 300 ms en `pages/Admin/Users.tsx`.
- **El toast de éxito (`react-hot-toast`, `top-right`) tapaba el botón "Salir"**
  del header durante sus ~4 s de vida, absorbiendo el clic (confirmado con
  `document.elementFromPoint` sobre el botón). Se cambió `<Toaster position="bottom-right">`
  en `App.tsx` — no es solo un artefacto de la prueba automatizada: cualquier
  usuario real que hiciera clic en "Salir" justo tras una acción con toast (login,
  registro, crear/editar algo) se habría topado con el mismo bloqueo.

**Pruebas: backend 115 (12 suites) + frontend 5 (vitest)** — + `calculators`, `projects` (incluye fechas de proyecto), `admin`.
(Frontend de Proyectos y de Administración verificados end-to-end en navegador
real; no tienen pruebas `vitest` propias todavía — ver nota de EP-03 arriba.)

*(EP-04, EP-05 … EP-13: ver `HISTORIAS-DE-USUARIO.md`, ❌ salvo lo indicado en `ESTADO.md`.)*

---

## HU-00.2 — Conexión PostgreSQL / Redis · ✅

**Criterios de aceptación**

| Criterio | Estado | Verificación |
|----------|:---:|--------------|
| La configuración lee host/puerto/credenciales de `.env` | ✅ | `config/database.ts` y `config/redis.ts` leen `DB_*` / `REDIS_*`. Test: `src/config/__tests__/database.test.ts`. |
| La app arranca aunque BD/caché no respondan y registra el fallo sin caerse | ✅ | Probado con `DB_PORT=59999 REDIS_PORT=59998`: el servidor responde `/api/health` 200 y loguea el error. Test: `src/__tests__/status.test.ts`. |
| `/api/status` refleja el estado real de BD y caché | ✅ | `{"database":"connected\|disconnected","cache":"connected\|disconnected"}`. |

**Qué se implementó**

- `backend/src/config/database.ts` — instancia Sequelize. `DB_DIALECT` = `postgres`
  (por defecto) o `sqlite` (archivo local, sin infraestructura); valida el valor.
  `connectDatabase()` no lanza; `disconnectDatabase()` para el apagado ordenado.
  `retry: { max: 1 }` para no colgar el arranque 30 s si la base no está.
- `backend/src/config/redis.ts` — cliente Redis con `reconnectStrategy` acotado
  (5 reintentos y se rinde); `connectRedis()` / `disconnectRedis()`; el fallo se
  registra una sola vez.
- `backend/src/index.ts` — conecta ambos con `Promise.allSettled` (no bloquea);
  `/api/status` reporta el estado real; **apagado ordenado** con `SIGINT`/`SIGTERM`
  (cierra el servidor HTTP + BD + Redis); `start()` no corre bajo `NODE_ENV=test`.
- Pruebas: `supertest` + jest (`status.test.ts`, `database.test.ts`).
- `logger.ts` usa `process.cwd()` para la carpeta de logs (compatible con el CJS
  de ts-jest; se quitó `import.meta.url`) y queda silencioso bajo `NODE_ENV=test`.

**Cómo probarlo**

```bash
docker compose up -d postgres redis
cd backend && cp .env.example .env      # ya trae puertos 5433/6380
npm run migrate --workspace=construapp-backend
npm run dev:backend
curl http://localhost:5000/api/status   # -> database: connected, cache: connected
```

---

## HU-00.1 — El monorepo compila sin errores · ✅

| Check | backend | frontend | mobile |
|-------|:---:|:---:|:---:|
| `npm install` | ✅ sin conflictos ni `ERESOLVE`, idempotente ("up to date" al re-ejecutar) | | |
| `npm run typecheck` (`tsc --noEmit`) | ✅ | ✅ | ✅ |
| `npm run lint` (eslint) | ✅ | ✅ | ✅ |
| `npm run build` | ✅ `tsc` → `dist/` | ✅ `tsc && vite build` → `dist/` | ✅ `expo export` → `dist/` (bundles Hermes android+ios) |
| `npm run test` | ✅ jest (19 tests, 4 suites) | ✅ vitest (sin tests) | ✅ jest (sin tests) |

> `mobile` no tenía script `build`; se añadió `expo export --platform android --platform ios`
> (el equivalente real a "compilar" para RN: empaqueta el JS y lo pasa a Hermes).
> `expo build` está deprecado en SDK 50.

Deuda aceptada (no rompe nada): `npm audit` reporta vulns transitivas de tooling y
`npm ls` marca `react@18.3.1` "invalid" bajo `react-native` (que fija `18.2.0`) — se
mantiene la alineación exacta de Expo SDK 50, ver `ROADMAP.md` / memoria del proyecto.

---

## HU-00.3 — Modelos + migración inicial · ✅

| Criterio de aceptación | ✓ | Verificación |
|---|:--:|---|
| `npm run migrate` crea las 7 tablas con sus relaciones | ✅ | `migration.test.ts` sobre SQLite en memoria comprueba las 7 tablas; en vivo contra Postgres crea `users, providers, materials, material_prices, projects, project_calculations, calculator_types`. |
| Idempotente (ejecutar dos veces no falla) | ✅ | Test dedicado; `sync()` usa `CREATE TABLE IF NOT EXISTS`. |
| Cada migración tiene su `down` | ✅ | `0001-initial.migration.ts` exporta `down()` (`sequelize.drop()`), con test. |

Modelos en `backend/src/models/index.ts` (clases `Model` con `InferAttributes`),
asociaciones `User 1—N Project 1—N ProjectCalculation` y `Provider/Material 1—N MaterialPrice`.

> Las **migraciones siguientes** deben ser DDL explícito (`queryInterface.createTable/…`),
> no `sync()`. El `sync()` solo es aceptable para la migración inicial de un proyecto nuevo.

---

## HU-00.4 — Middleware de validación y manejo de errores · ✅

| Criterio de aceptación | ✓ | Verificación |
|---|:--:|---|
| Los errores de validación devuelven 400 con `details` por campo | ✅ | `validate(schema)` (Joi, `abortEarly:false`) → `ApiError(400, 'Validación fallida', { campo: motivo })`. Tests en `middleware.test.ts`. |
| Los errores no controlados devuelven 500 con formato uniforme y quedan en el log | ✅ | `errorHandler` registra el stack y responde `{error, status:500}` (mensaje genérico en `production`). |

**Archivos**

- `backend/src/utils/ApiError.ts` — error de dominio con `status` + helpers
  (`ApiError.notFound(...)`, `.forbidden(...)`, …). Lo lanzarán servicios y controladores.
- `backend/src/middleware/validate.ts` — `validate(schema, 'body'|'query'|'params')`.
  Convierte tipos, descarta campos desconocidos, reemplaza con el valor saneado.
- `backend/src/middleware/errorHandler.ts` — `errorHandler` + `notFoundHandler`.
  Traduce `ApiError`, `SequelizeValidationError` y JSON malformado; todo lo demás → 500.
- `index.ts` ahora solo hace `app.use(notFoundHandler); app.use(errorHandler);`
  (se quitaron los handlers embebidos).

Respuesta uniforme de error: `{ "error": string, "status": number, "details"?: object }`.

---

## EP-01 — Autenticación (backend) · ✅

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|:---:|-------------|
| `POST` | `/api/auth/register` | — | Crea la cuenta. `201` con el usuario (sin `password`). Correo duplicado → `400`. |
| `POST` | `/api/auth/login` | — | `200` con `{ token, refreshToken, expiresIn, user }`. Credenciales inválidas → `401` genérico. |
| `POST` | `/api/auth/refresh` | — | Rota el refresh token: `200` con **token y refreshToken nuevos**; el anterior queda revocado. |
| `POST` | `/api/auth/logout` | — | Revoca la familia del refresh token. `204`. Idempotente. |
| `GET` | `/api/auth/me` | Bearer | Perfil del usuario autenticado. |
| `PATCH` | `/api/auth/me` | Bearer | Actualiza `name` / `userType`. |
| `POST` | `/api/auth/change-password` | Bearer | Exige `currentPassword`; al cambiarla **revoca todas las sesiones**. `204`. |

### Cómo funciona

- **Contraseñas**: hash bcrypt (10 rondas) en un hook `beforeSave` del modelo `User`.
- **Access token**: JWT `HS256`, TTL `JWT_EXPIRE` (por defecto `15m`), payload `{ sub, role, email }`.
- **Refresh token**: valor opaco aleatorio; en BD solo se guarda su **SHA-256**.
  Vida `JWT_REFRESH_EXPIRE_DAYS` (30). Modelo `RefreshToken` con `family` + `revokedAt`.
- **Rotación con detección de reúso**: cada `refresh` revoca el token usado y emite
  otro en la misma `family`. Si llega un token ya revocado → se revoca **toda la
  familia** (posible robo) y se responde `401`.
- **`requireAuth`** (`middleware/auth.ts`) valida `Authorization: Bearer` y deja
  `req.user`; **`requireRole(...roles)`** para RBAC.
- Rate limit estricto (10 / 15 min) en `login` y `register` (se omite en test).

### Archivos nuevos

`models/index.ts` (+`RefreshToken`, hooks y helpers en `User`), `utils/tokens.ts`,
`utils/asyncHandler.ts`, `schemas/authSchemas.ts`, `services/authService.ts`,
`middleware/auth.ts`, `controllers/authController.ts`, `routes/{auth,index}.ts`,
`types/express.d.ts`. Tests: `src/__tests__/auth.test.ts` (11 casos, flujo completo
sobre SQLite en memoria).

### Criterios de aceptación

| HU | Criterio | ✓ |
|----|----------|:--:|
| HU-01.1 | Registro: hash bcrypt (`$2b$10$…`, verificado en BD); correo duplicado (aun con otra capitalización) → 400; contraseña < 8 → 400; `userType` fuera de `owner\|contractor\|engineer\|provider` → 400. Formulario web con `zod` + auto-login. | ✅ |
| HU-01.2 | `token` (JWT) + `refreshToken` (opaco, 80 chars) + `user` (sin `password`); contraseña incorrecta y correo inexistente devuelven **respuestas 401 idénticas**; rate-limit por IP en `login`/`register` (`AUTH_RATE_LIMIT_MAX`, def. 10; `skipSuccessfulRequests`). Toast de error en la web. | ✅ |
| HU-01.3 | Cada `/refresh` devuelve `token` + `refreshToken` nuevos e invalida el anterior; el nuevo access token sirve; una cadena legítima de rotaciones no da falsos positivos; **reutilizar un token ya rotado revoca toda la familia** (el token que era válido también deja de servir). Interceptor de axios en la web renueva de forma transparente ante un 401. | ✅ |
| HU-01.4 | **Backend**: toda ruta protegida sin `Bearer` (o con token mal formado / firma inválida / expirado) → `401`; rol insuficiente → `403`; las públicas siguen a `200`. **Frontend**: `<ProtectedRoute>` sin sesión → `/login` guardando `state.from`; tras entrar vuelve a la URL pedida (round-trip verificado en navegador). Tests: `auth-guard.test.ts` (9 casos) + `ProtectedRoute.test.tsx` (3). | ✅ |
| HU-01.5 | **Backend**: `POST /auth/logout` → `204`, revoca toda la familia del refresh token (idempotente; cerrar sesión en un dispositivo no toca otras sesiones del usuario). **Frontend**: `logout()` llama al endpoint, **borra los tokens de `localStorage`** y pone `user = null` → `<ProtectedRoute>` manda a `/login`. Round-trip verificado en navegador. | ✅ |
| HU-01.6 | `POST /auth/forgot-password` → **siempre `204`** (no revela si el correo existe; si existe, genera un token opaco de 64 hex, guarda su SHA-256 con expiración de 30 min, envía el enlace — o lo escribe en el log sin SMTP). `POST /auth/reset-password {token, newPassword}` → `204`: fija la contraseña, marca el token **usado** (un solo uso), **revoca todas las sesiones**. Token inválido/expirado/reusado → `400`. Una nueva solicitud invalida la anterior. Páginas web `/forgot-password` y `/reset-password?token=…`. Verificado E2E en navegador. Tests: `auth-reset.test.ts` (8 casos). | ✅ |
| HU-01.7 | Editar perfil; cambiar contraseña exige la actual y revoca sesiones | ✅ (falta pantalla) |

### Frontend de EP-01 — ✅

`services/api.ts` (axios + interceptor de refresh transparente + `tokenStore`),
`services/auth.ts`, `context/AuthContext.tsx`, `hooks/useAuth.ts`,
`components/ProtectedRoute.tsx`. Páginas: `Login`, `Register`, `ForgotPassword`,
`ResetPassword` (`react-hook-form` + `zod`); `Layout` con logout y nombre;
`Dashboard` con datos del usuario. **Falta**: pantalla de perfil (HU-01.7 UI).

---

## EP-02 — Motor de cálculo (backend) · ✅

### Endpoints (públicos — HU-02.10)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/calculators/types` | `{ calculators: [{ id, name, description, fields }] }` (del catálogo sembrado). |
| `POST` | `/api/calculators/concrete` | Body `{ length, width, height, wastePct? }` (metros). |
| `POST` | `/api/calculators/brick` | Body `{ width, height, wastePct? }` (metros de muro). |
| `POST` | `/api/calculators/mortar` | Body `{ area, thickness, wastePct? }` (m² y cm). |

### Forma del resultado

```jsonc
{
  "calculatorType": "concrete",
  "quantity": 3, "unit": "m³",      // magnitud principal (volumen o área)
  "wastePct": 5,
  "materials": [
    { "id", "role": "cement", "name": "Cemento gris", "quantity": 23,
      "unit": "saco 50 kg", "pricePerUnit": 34200, "totalPrice": 786600,
      "currency": "COP", "provider": { "id", "name": "Ferretería La Roca (demo)" } }
  ],
  "totalCost": 1165490, "currency": "COP",
  "missingPrices": [],               // roles sin precio en catálogo (no rompe el cálculo)
  "timestamp": "2026-09-08T20:..."
}
```

### Cómo funciona

- **Fórmulas y dosificaciones** en `utils/dosifications.ts`, con aviso destacado
  de que son aproximadas y deben validarse con un ingeniero (HU-02 riesgo §7):
  hormigón ~3000 psi 1:2:3, mampostería tolete muro de soga junta 1 cm,
  mortero 1:4. `wastePct` (0–30, por defecto 5) multiplica las cantidades.
- El cemento se redondea **hacia arriba** a sacos enteros; arena/grava a 2 decimales.
- **Precios** (`services/priceService.ts`): mapea cada "rol" (`cement`, `sand`,
  `gravel`, `brick`, `mortarMix`) a un material del catálogo, busca todos sus
  precios con proveedor y toma el **más barato**. Sin precio → `pricePerUnit: null`
  y el rol se añade a `missingPrices`, sin interrumpir.
- `services/calculatorService.ts` orquesta; `controllers/calculatorController.ts`
  + `routes/calculators.ts` (montado en `/api/calculators`).

### Criterios de aceptación

| HU | Criterio | ✓ |
|----|----------|:--:|
| HU-02.1 | `/types` devuelve id/name/description/fields de las 3 calculadoras | ✅ |
| HU-02.2 | Hormigón: volumen L·W·H + cemento(sacos)/arena/grava con precio y proveedor | ✅ |
| HU-02.3 | Ladrillo: unidades + mortero; dimensión ≤ 0 → 400 | ✅ |
| HU-02.4 | Mortero: volumen area·(esp/100) + cemento/arena | ✅ |
| HU-02.5 | Precios del catálogo (no fijos), proveedor más barato, COP, `timestamp` | ✅ |
| HU-02.6 | Validación cliente/servidor: positivas, obligatorias, `details` por campo | ✅ |
| HU-02.7 | `wastePct` recalcula las cantidades | ✅ |

### Pendiente

- **Frontend**: formularios por calculadora (según `fields`) + pantalla de resultado.
- HU-02.9: exponer la **comparativa** de proveedores (hoy solo se elige el más barato).
- HU-02.11 / HU-02.12 más adelante.

---

## EP-03 — Proyectos y presupuestos (backend + frontend) · ✅

### Endpoints (`/api/projects/*`, todos requieren `Bearer`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/` | Crea el proyecto (`201`). Body `{ name, description?, location?, budget?, startDate?, endDate? }`. |
| `GET` | `/` | `{ projects: [...], total }` del usuario (el `admin` ve todos). Cada uno con `summary`. |
| `GET` | `/:projectId` | Proyecto + `calculations[]` (desc por fecha) + `summary`. Ajeno → `403`; inexistente → `404`. |
| `PATCH` | `/:projectId` | Actualiza campos permitidos, incluido `status` (`planning`\|`in-progress`\|`finished`). |
| `DELETE` | `/:projectId` | `204`. Borra en cascada los cálculos. |
| `POST` | `/:projectId/calculations` | Body `{ calculatorType, inputs }`. **Recalcula en el servidor** (precios actuales) y guarda. `201` con `{ calculation, summary }`. |
| `DELETE` | `/:projectId/calculations/:calculationId` | Elimina el cálculo. `200` con `{ summary }`. |

### `summary` — presupuesto acumulado frente al objetivo (HU-03.5)

```jsonc
{
  "totalCalculations": 1,
  "totalCost": 1165490,
  "budget": 3000000,          // null si el proyecto no tiene presupuesto objetivo
  "budgetUsedPct": 38.8,      // null si no hay budget
  "budgetRemaining": 1834510, // budget - totalCost
  "overBudget": false
}
```

### Cómo funciona

- `services/projectService.ts` — CRUD + `addCalculation` / `removeCalculation` +
  `summary`. `loadOwned()` verifica propiedad (o rol `admin`) antes de cualquier operación.
- **HU-02.8**: `addCalculation` **no confía** en el cliente — llama a
  `calculatorService.run(calculatorType, inputs)` (valida la entrada con el
  esquema Joi correcto y usa precios actuales), y guarda `inputs` + `result` +
  `totalCost` en `ProjectCalculation`.
- Los campos `DECIMAL` (`budget`, `totalCost`) se serializan como número
  (override de `toJSON` en los modelos).
- `utils/joiDetails.ts` centraliza el formato `{ campo: mensaje }` (lo usan
  `middleware/validate.ts` y `calculatorService.run`).

### Criterios de aceptación

| HU | Criterio | ✓ |
|----|----------|:--:|
| HU-03.1 | `POST` con `name` → 201, `status: planning`, `createdBy`; fechas incoherentes → 400 | ✅ |
| HU-03.2 | Lista solo los míos; con 0 proyectos `total: 0` | ✅ |
| HU-03.3 | Detalle con `calculations[]`; proyecto ajeno → 403 | ✅ |
| HU-03.4 | `PATCH` / `DELETE`; ajeno → 403 | ✅ |
| HU-03.5 | `summary` con `totalCost`, `budgetUsedPct`, `budgetRemaining`, `overBudget` | ✅ |
| HU-03.6 | `DELETE …/calculations/:id` reajusta el presupuesto | ✅ |
| HU-03.7 | `status` editable entre los 3 valores | ✅ |
| HU-02.8 | Guardar cálculo recalculado en servidor; ajeno → 403 | ✅ |

### Pendiente

- HU-03.9 (duplicar proyecto) — no en el alcance del MVP mínimo.

---

## EP-12 — Back-office (backend + frontend) · ✅

### Endpoints (`/api/admin/*`, requieren `Bearer` **con rol `admin`**)

| Método | Ruta | |
|--------|------|---|
| `GET` / `POST` | `/materials` | listar / crear material |
| `PATCH` / `DELETE` | `/materials/:id` | editar / **baja lógica** (`active: false`, no se borra) |
| `GET` / `POST` | `/providers` | listar / crear proveedor |
| `PATCH` | `/providers/:id` | editar proveedor |
| `GET` | `/prices?materialId=&providerId=` | precios con material y proveedor incluidos |
| `PUT` | `/prices` | **upsert** de precio: `{ materialId, providerId, price, currency? }` → `201` si se crea, `200` si se actualiza |
| `DELETE` | `/prices/:id` | eliminar un precio |
| `GET` | `/users?status=&role=&q=` | listar usuarios (sin `password`) |
| `PATCH` | `/users/:id/status` | `{ status: "active" \| "suspended" }` |

### Reglas

- Un no-admin recibe **403**; sin sesión, **401**.
- **Materiales**: no se borran (baja lógica) para no romper cálculos ni precios históricos.
- **Precios**: índice único `(material_id, provider_id)` → un solo precio por par;
  `PUT /prices` crea o actualiza. Valida que material y proveedor existan (→ 400).
- **Usuarios**: suspender **revoca todas las sesiones** de esa cuenta y bloquea
  el login (`403`). El admin no puede cambiarse el estado a sí mismo (`400`).

### Admin inicial

`npm run seed` ejecuta `0002-admin.seed.ts`: si `ADMIN_EMAIL` y `ADMIN_PASSWORD`
están en `.env`, crea esa cuenta como `admin` (o promueve la existente). Sin esas
variables, se omite. Alternativa manual: `UPDATE users SET role='admin' WHERE email='…'`.

### Criterios de aceptación

| HU | Criterio | ✓ |
|----|----------|:--:|
| HU-12.1 | Admin crea/edita/desactiva materiales con nombre, unidad, categoría; solo admin | ✅ |
| HU-12.2 | Admin registra/actualiza el precio de un material por proveedor con su fecha | ✅ |
| HU-12.3 | Admin ve el estado de las cuentas y puede suspender/reactivar; suspendida no inicia sesión | ✅ |

### Pendiente

- Nada pendiente en el alcance del MVP para esta épica.
