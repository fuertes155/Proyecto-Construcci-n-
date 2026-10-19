# 📡 Documentación de API - ConstruApp Nariño

## Base URL

```
Development: http://localhost:5000/api
Production: https://api.construappnariño.com/api
```

## Autenticación

Todos los endpoints (excepto `/auth/login`, `/auth/register`) requieren un token JWT en el header:

```
Authorization: Bearer <your_jwt_token>
```

## Códigos de Respuesta

| Código | Significado |
|--------|------------|
| `200` | OK - Solicitud exitosa |
| `201` | Created - Recurso creado |
| `400` | Bad Request - Parámetros inválidos |
| `401` | Unauthorized - Token inválido o faltante |
| `403` | Forbidden - No tienes permiso |
| `404` | Not Found - Recurso no encontrado |
| `500` | Internal Server Error - Error del servidor |

---

## 🔐 Autenticación

### Registro de Usuario

**POST** `/auth/register`

Crea una nueva cuenta de usuario.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "name": "Juan Pérez",
  "userType": "contractor" // owner | contractor | engineer | provider
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "userType": "contractor",
  "createdAt": "2026-01-15T10:30:00Z"
}
```

**Response (400):**
```json
{
  "error": "Email ya existe"
}
```

---

### Login

**POST** `/auth/login`

Inicia sesión y obtiene un token JWT.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "userType": "contractor"
  },
  "expiresIn": "7d"
}
```

---

### Refrescar Token (con rotación)

**POST** `/auth/refresh`

Rota el refresh token: **revoca el actual y devuelve uno nuevo** junto con un
access token nuevo. Si se reenvía un refresh token ya rotado, se revoca toda la
sesión y se responde `401`.

**Request Body:**
```json
{ "refreshToken": "<opaco>" }
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "<opaco nuevo>",
  "expiresIn": "15m"
}
```

---

### Cerrar sesión

**POST** `/auth/logout` — Body `{ "refreshToken": "<opaco>" }` → `204`. Revoca la
familia completa del refresh token. Idempotente.

---

### Perfil

**GET** `/auth/me` *(Bearer)* → datos del usuario autenticado.

**PATCH** `/auth/me` *(Bearer)* — Body `{ "name"?, "userType"? }` → usuario actualizado.
`userType` ∈ `owner | contractor | engineer | provider`.

**POST** `/auth/change-password` *(Bearer)* — Body `{ "currentPassword", "newPassword" }`
→ `204`. Exige la contraseña actual y **revoca todas las sesiones activas**.

---

### Recuperar contraseña

**POST** `/auth/forgot-password` — Body `{ "email" }` → **siempre `204`** (no revela
si el correo existe). Si existe, genera un enlace con un token de un solo uso
válido `PASSWORD_RESET_EXPIRE_MINUTES` (30). Sin SMTP configurado, el enlace se
escribe en el log del backend.

**POST** `/auth/reset-password` — Body `{ "token", "newPassword" }` → `204`. Fija la
nueva contraseña, marca el token como usado y **revoca todas las sesiones**.
Token inválido / expirado / ya usado → `400 "El enlace no es válido o ya expiró"`.
El enlace del correo apunta a `FRONTEND_URL/reset-password?token=…`.

> **Notas de implementación (Fase 1):** `expiresIn` es el TTL del access token
> (`JWT_EXPIRE`, por defecto `15m`); el refresh token vive `JWT_REFRESH_EXPIRE_DAYS`
> (30). Errores con forma uniforme `{ error, status, details? }`. `login`,
> `register`, `forgot-password` y `reset-password` tienen rate limit de 10
> intentos / 15 min por IP.

---

## 🧮 Calculadoras

### Obtener Tipos de Calculadoras

**GET** `/calculators/types`

Retorna todos los tipos de calculadoras disponibles.

**Response (200):**
```json
{
  "calculators": [
    {
      "id": "concrete",
      "name": "Calculadora de Hormigón",
      "description": "Calcula cantidad de hormigón necesaria",
      "fields": [
        {
          "name": "length",
          "label": "Largo (m)",
          "type": "number",
          "required": true
        },
        {
          "name": "width",
          "label": "Ancho (m)",
          "type": "number",
          "required": true
        },
        {
          "name": "height",
          "label": "Alto (m)",
          "type": "number",
          "required": true
        }
      ]
    },
    {
      "id": "brick",
      "name": "Calculadora de Ladrillos",
      "description": "Calcula cantidad de ladrillos necesarios"
    },
    {
      "id": "mortar",
      "name": "Calculadora de Mortero",
      "description": "Calcula cantidad de mortero necesario"
    }
  ]
}
```

---

### Calcular Hormigón

**POST** `/calculators/concrete` — *público (no requiere sesión).*

**Request Body:** `{ "length": 5, "width": 4, "height": 0.15, "wastePct"?: 5 }`
(dimensiones en metros; `wastePct` 0–30, por defecto 5).

**Response (200):**
```jsonc
{
  "calculatorType": "concrete",
  "quantity": 3,            // magnitud principal (volumen); en brick/mortar es el área/volumen
  "unit": "m³",
  "wastePct": 5,
  "materials": [
    {
      "id": "<uuid material>",
      "role": "cement",              // cement | sand | gravel | brick | mortarMix
      "name": "Cemento gris",
      "quantity": 23,
      "unit": "saco 50 kg",
      "pricePerUnit": 34200,          // null si no hay precio en el catálogo
      "totalPrice": 786600,
      "currency": "COP",
      "provider": { "id": "<uuid>", "name": "Ferretería La Roca (demo)" }
    }
    // … arena (sand), grava (gravel)
  ],
  "totalCost": 1165490,
  "currency": "COP",
  "missingPrices": [],       // roles sin precio disponible (no interrumpen el cálculo)
  "timestamp": "2026-09-08T20:00:00.000Z"
}
```

Se elige siempre el **proveedor con el precio más bajo** por material. El cemento
se redondea hacia arriba a sacos enteros; arena y grava a 2 decimales.

---

### Calcular Ladrillos

**POST** `/calculators/brick` — *público.*
Body `{ "width": 5, "height": 2.5, "wastePct"?: 5 }` (metros de muro).
Devuelve `materials` con `role: "brick"` (unidades) y `role: "mortarMix"`
(sacos de mortero seco), con la misma forma que hormigón.

---

### Calcular Mortero

**POST** `/calculators/mortar` — *público.*
Body `{ "area": 20, "thickness": 2, "wastePct"?: 5 }` (área en m², espesor en cm).
Devuelve `materials` con `role: "cement"` y `role: "sand"` (dosificación 1:4).

---

### Otras calculadoras

Todas son **públicas**, aceptan `wastePct` opcional (0–30, por defecto 5) y
devuelven la misma forma que hormigón. Los valores de referencia están en
`backend/src/utils/dosifications.ts`.

| Endpoint | Body | `materials[].role` |
|---|---|---|
| **POST** `/calculators/block` — muro en bloque n.º 4 | `{ "width": 5, "height": 2.5 }` (m) | `block` (unidades), `mortarMix` (sacos 40 kg) |
| **POST** `/calculators/rebar` — malla de acero para placa | `{ "length": 4, "width": 3, "spacing": 20 }` (m, m, cm; separación 5–50) | `rebar` (varillas 1/2" × 6 m), `tieWire` (kg de alambre) |
| **POST** `/calculators/paint` — pintura vinilo | `{ "area": 40, "coats"?: 2 }` (m²; manos 1–5) | `paint` (galones) |
| **POST** `/calculators/tile` — piso o enchape | `{ "area": 20 }` (m²) | `tile` (m²), `tileAdhesive` (sacos 25 kg), `grout` (bolsas 2 kg) |
| **POST** `/calculators/footing` — cimiento ciclópeo | `{ "length": 10, "width": 0.4, "height": 0.6, "stonePct"?: 40 }` (m; piedra 0–60 %) | `cement`, `sand`, `gravel`, `stone` (m³ de piedra rajón) |
| **POST** `/calculators/roof` — cubierta en teja | `{ "area": 30, "sheet"?: "fibrocemento" }` (m² sobre la pendiente) | `roofSheet` (tejas), `roofHook` (ganchos) |

Cualquiera de estos ids sirve también como `calculatorType` al guardar un cálculo
en un proyecto (`POST /projects/:id/calculations`).

**Elección de material** (campo opcional; si se omite se usa el primero):

| Calculadora | Campo | Valores |
|---|---|---|
| `concrete` | `strength` | `3000` (1:2:3) · `2500` (1:2:4) · `3500` (1:2:2) |
| `mortar` | `mix` | `1:4` · `1:3` · `1:5` |
| `brick` | `brickUnit` | `tolete` · `arcilla4` (bloque de arcilla n.º 4) |
| `block` | `blockSize` | `n4` · `n6` |
| `rebar` | `diameter` | `1/2` · `3/8` · `5/8` |
| `paint` | `paintType` | `vinilo1` · `vinilo2` · `exterior` |
| `tile` | `tileType` | `ceramica` · `porcelanato` |
| `roof` | `sheet` | `fibrocemento` (n.º 6) · `zinc` |

Cada opción cotiza su propio material del catálogo (p. ej. `diameter: "3/8"` →
"Varilla corrugada 3/8" x 6 m").

> **Nota:** las dosificaciones son aproximadas (referencias de obra) y deben
> validarse con un ingeniero civil antes de usarse en presupuestos reales.

**Errores (400):** dimensiones ≤ 0 o campos faltantes →
`{ "error": "Validación fallida", "status": 400, "details": { "width": "…" } }`

---

## 🏪 Catálogo público (EP-04)

*Públicas: no requieren sesión.*

**GET** `/materials?q=varilla&category=acero` — materiales activos con el precio de
cada proveedor (del más barato al más caro). `q` busca sin tildes ni mayúsculas.

```json
{
  "materials": [
    {
      "id": "uuid", "name": "Varilla corrugada 1/2\" x 6 m", "unit": "unidad", "category": "acero",
      "bestPrice": { "providerId": "uuid", "providerName": "Ferretería La Roca (demo)", "price": 37500, "updatedAt": "…" },
      "prices": [ { "providerId": "uuid", "providerName": "…", "location": "Pasto, Nariño", "price": 37500, "updatedAt": "…" } ]
    }
  ],
  "categories": ["acabados", "acero", "…"],
  "total": 3
}
```

**GET** `/providers?location=Pasto&rating=4&category=acero&material=<uuid>` —
proveedores con al menos un precio registrado (HU-04.1/04.2), ordenados por
calificación: `{ providers: [{ id, name, location, phone, email, rating, deliveryTime,
materialsOffered, categories }], locations, total }`. `rating` es la mínima (0–5).

**GET** `/providers/:id` — ficha del proveedor con sus precios vigentes y su fecha
de actualización (HU-04.3/04.4): `{ …proveedor, prices: [{ materialId, name, unit,
category, price, updatedAt }] }`. Inexistente → `404`; id mal formado → `400`.

---

## 📋 Proyectos

*Todas las rutas requieren `Authorization: Bearer <token>`. Cada usuario solo ve
sus proyectos (el rol `admin` los ve todos). Proyecto ajeno → `403`; inexistente → `404`.*

### Crear Proyecto

**POST** `/projects` — Body:
```jsonc
{
  "name": "Casa en Pasto",       // requerido
  "description": "…",
  "location": "Pasto, Nariño",
  "budget": 50000000,             // opcional; presupuesto objetivo (COP)
  "startDate": "2026-02-01",
  "endDate": "2026-12-31"         // debe ser ≥ startDate
}
```
**Response (201):** el proyecto con `status: "planning"`, `userId`, `createdAt`.

---

### Listar mis proyectos

**GET** `/projects` → `{ projects: [ { …proyecto, summary } ], total }`.
Cada proyecto incluye su `summary` (ver abajo).

---

### Detalle de proyecto

**GET** `/projects/:projectId` →
```jsonc
{
  "id": "uuid", "name": "Casa en Pasto", "status": "planning",
  "budget": 50000000, "location": "…", "userId": "uuid",
  "calculations": [
    {
      "id": "uuid", "calculatorType": "concrete",
      "inputs": { "length": 5, "width": 4, "height": 0.15 },
      "result": { /* resultado completo de la calculadora */ },
      "quantity": 3, "unit": "m³", "totalCost": 1165490,
      "createdAt": "…"
    }
  ],
  "summary": {
    "totalCalculations": 1,
    "totalCost": 1165490,
    "budget": 50000000,
    "budgetUsedPct": 2.3,          // null si no hay budget
    "budgetRemaining": 48834510,
    "overBudget": false
  }
}
```

---

### Actualizar / Eliminar

**PATCH** `/projects/:projectId` — Body con los campos a cambiar, incluido
`status` (`planning` | `in-progress` | `finished`). → proyecto actualizado.

**DELETE** `/projects/:projectId` → `204`. Borra en cascada los cálculos.

---

### Guardar un cálculo en el proyecto

**POST** `/projects/:projectId/calculations` — Body:
```json
{ "calculatorType": "concrete", "inputs": { "length": 5, "width": 4, "height": 0.15 } }
```
El servidor **vuelve a ejecutar la calculadora** (precios actuales, no confía en
el cliente) y guarda el cálculo. → `201` con `{ calculation, summary }`.

**DELETE** `/projects/:projectId/calculations/:calculationId` → `200` con `{ summary }`.

---

## 🛠️ Administración (back-office)

*Todas las rutas requieren `Authorization: Bearer <token>` **con rol `admin`**.
Un usuario sin ese rol recibe `403`.*

### Catálogo de materiales

| Método | Ruta | |
|--------|------|---|
| `GET` | `/admin/materials` | `{ materials: [...] }` |
| `POST` | `/admin/materials` | `{ name, unit, category?, description?, active? }` → `201` |
| `PATCH` | `/admin/materials/:id` | edita los campos enviados |
| `DELETE` | `/admin/materials/:id` | **baja lógica** (`active: false`; no se borra) |

### Proveedores

| Método | Ruta | |
|--------|------|---|
| `GET` / `POST` | `/admin/providers` | listar / crear `{ name, location?, phone?, email?, rating?, deliveryTime? }` |
| `PATCH` | `/admin/providers/:id` | editar |

### Precios por proveedor

| Método | Ruta | |
|--------|------|---|
| `GET` | `/admin/prices?materialId=&providerId=` | precios con `material` y `provider` incluidos |
| `PUT` | `/admin/prices` | **upsert**: `{ materialId, providerId, price, currency? }` → `201` si se crea, `200` si se actualiza. Un solo precio por par (material, proveedor). |
| `DELETE` | `/admin/prices/:id` | `204` |

### Moderación de usuarios

| Método | Ruta | |
|--------|------|---|
| `GET` | `/admin/users?status=&role=&q=` | `{ users: [...sin password], total }` |
| `PATCH` | `/admin/users/:id/status` | `{ status: "active" \| "suspended" }`. Suspender revoca las sesiones del usuario y bloquea su login. El admin no puede cambiarse su propio estado (`400`). |

---

## 👥 Proveedores

### Obtener Proveedores

**GET** `/providers`

Retorna lista de proveedores disponibles.

**Query Parameters:**
- `materialType`: Filtrar por tipo de material (concrete, brick, etc.)
- `location`: Filtrar por ubicación
- `rating`: Filtrar por calificación mínima (1-5)

**Response (200):**
```json
{
  "providers": [
    {
      "id": "uuid",
      "name": "Proveedora Local",
      "location": "Pasto, Nariño",
      "phone": "+57 312 456 7890",
      "email": "info@proveedora.com",
      "rating": 4.8,
      "materialsOffered": ["cement", "sand", "gravel"],
      "deliveryTime": "24h"
    }
  ],
  "total": 1
}
```

---

### Obtener Precios en Tiempo Real

**GET** `/providers/:providerId/prices`

Obtiene precios actuales de un proveedor.

**Response (200):**
```json
{
  "providerId": "uuid",
  "providerName": "Proveedora Local",
  "prices": [
    {
      "materialId": "cement",
      "materialName": "Cemento",
      "unit": "saco",
      "price": 32000,
      "lastUpdated": "2026-01-15T09:00:00Z"
    },
    {
      "materialId": "sand",
      "materialName": "Arena",
      "unit": "m³",
      "price": 85000,
      "lastUpdated": "2026-01-15T09:00:00Z"
    }
  ]
}
```

---

## 📊 Análisis y Reportes

### Obtener Reporte de Proyecto

**GET** `/projects/:projectId/report`

Genera un reporte completo del proyecto.

**Query Parameters:**
- `format`: json o pdf (default: json)

**Response (200):**
```json
{
  "projectId": "uuid",
  "projectName": "Casa en Pasto",
  "summary": {
    "totalCalculations": 5,
    "totalCost": 2850000,
    "estimatedBudgetUsed": "5.7%"
  },
  "calculations": [
    {
      "type": "concrete",
      "quantity": 3,
      "unit": "m³",
      "cost": 726000,
      "date": "2026-01-15"
    }
  ],
  "recommendations": [
    "Considere comprar hormigón con descuento por volumen"
  ]
}
```

---

## ⚠️ Errores Comunes

### Error 401 - Token Inválido

```json
{
  "error": "Token inválido o expirado",
  "code": "INVALID_TOKEN"
}
```

**Solución:** Verifica que el token sea válido y esté actualizado. Si expiró, usa el refresh token.

---

### Error 400 - Parámetros Inválidos

```json
{
  "error": "Validación fallida",
  "details": {
    "length": "Debe ser un número positivo",
    "width": "Es requerido"
  }
}
```

**Solución:** Verifica que todos los parámetros sean válidos.

---

### Error 429 - Rate Limited

```json
{
  "error": "Demasiadas solicitudes",
  "retryAfter": 60
}
```

**Solución:** Espera 60 segundos antes de hacer otra solicitud.

---

## 📝 Notas de Implementación

- Todos los timestamps están en formato ISO 8601 (UTC)
- Los IDs son UUIDs v4
- Los precios están en pesos colombianos (COP)
- Las distancias se miden en metros
- La validación de entrada se hace tanto en cliente como en servidor

---

## 🔄 Flujos Comunes

### Flujo de Cálculo Completo

1. Usuario obtiene tipos de calculadora: `GET /calculators/types`
2. Usuario realiza un cálculo: `POST /calculators/concrete`
3. Sistema retorna materiales y proveedores
4. Usuario guarda en un proyecto: `POST /projects/:projectId/calculations`

### Flujo de Comparación de Proveedores

1. Usuario obtiene proveedores: `GET /providers`
2. Usuario obtiene precios de cada proveedor
3. Usuario compara automáticamente en la calculadora
4. Sistema sugiere mejor opción

---

**Última actualización:** Septiembre 2026
**Versión API:** 1.0.0
