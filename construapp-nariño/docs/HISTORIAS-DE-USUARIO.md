# 📖 Historias Épicas y de Usuario — ConstruApp Nariño

> Backlog de producto. Alineado con [`ROADMAP.md`](./ROADMAP.md),
> [`API.md`](./API.md) y [`ARCHITECTURE.md`](./ARCHITECTURE.md).
> Estado del código: ver [`ESTADO.md`](./ESTADO.md).
> Última actualización: 2026-09-08.

**Alcance de este documento:** el **MVP (Fase 1)** con detalle suficiente para
trabajar. Las Fases 2–4 quedan a **nivel de épica** (§5) para no perder el rumbo;
sus historias se redactarán cuando el MVP esté cerca de cerrarse.

**Versión para importar a Jira** (CSV UTF-8 con BOM, formato de importación de Jira):

1. [`Jira_PASO1_epicas.csv`](./Jira_PASO1_epicas.csv) — importar **primero** (las 8 épicas).
2. [`Jira_PASO2_historias.csv`](./Jira_PASO2_historias.csv) — importar **después**;
   la columna `Parent` enlaza cada historia con su épica por el nombre.

Columnas: `Issue Type` (Epic / Story / Task), `Summary`, `Description`, `Priority`
(High = Must, Medium = Should, Low = Could), `Parent`, `Original estimate` (horas),
`Story point estimate`, `Labels`, `Sprint` (`CAN Sprint 0`…`CAN Sprint 6`; vacío = backlog).

---

## 1. Cómo leer este documento

### 1.1 Formato

```
Como <persona>, quiero <capacidad>, para <beneficio>.
```

- **ID** — `HU-<épica>.<n>`.
- **Prioridad** — MoSCoW: **M** (Must, imprescindible para el MVP) · **S** (Should) · **C** (Could).
- **Estimación** — puntos de historia (Fibonacci: 1, 2, 3, 5, 8).
- **Criterios de aceptación** — *Dado / Cuando / Entonces*.

### 1.2 Personas

| ID | Persona | Qué necesita | Rol RBAC (`ARCHITECTURE.md`) |
|----|---------|--------------|------------------------------|
| **P1** | **Propietario / Dueño de obra** | Saber *cuánto material y cuánto dinero*. Sin formación técnica. | `user` |
| **P2** | **Maestro de obra / Contratista** | Cálculos rápidos y listas de compra. | `user` |
| **P3** | **Ingeniero / Arquitecto** | Precisión, dosificaciones configurables, exportables. | `user` |
| **P4** | **Proveedor** | Publicar precios y captar clientes. *(Fase 2)* | `provider` |
| **P5** | **Administrador** | Operar la plataforma y el catálogo. | `admin` |
| **P6** | **Visitante** | Probar una calculadora antes de registrarse. | `guest` |

### 1.3 Definición de Preparada (DoR) / Terminada (DoD)

**DoR:** redactada como *Como/Quiero/Para* · criterios de aceptación verificables ·
dependencias identificadas · estimada · mockup enlazado si aplica.

**DoD:** PR revisado y en la rama principal · `typecheck`, `lint`, `test`, `build`
en verde · pruebas para la lógica nueva · endpoints nuevos en `docs/API.md` ·
sin regresiones de responsive/accesibilidad · `docs/ESTADO.md` actualizado si cambia el estado.

---

## 2. Épicas del MVP

| ID | Épica | Objetivo | Historias | Prioridad |
|----|-------|----------|-----------|-----------|
| **EP-00** | Fundación técnica | Base para construir la Fase 1 | 5 | M |
| **EP-01** | Autenticación y cuentas | Cada usuario con sus datos y proyectos | 7 | M |
| **EP-02** | Motor de cálculo de materiales | Núcleo de valor: material + costo | 9 | M |
| **EP-03** | Proyectos y presupuestos | Agrupar cálculos y presupuestar una obra | 7 | M |
| **EP-04** | Proveedores y precios locales | Precios reales del mercado de Nariño | 4 | M |
| **EP-12** | Back-office mínimo | Cargar catálogo y precios; moderar | 3 | M/S |
| **EP-13** | Calidad y experiencia transversal | Responsive, errores, CI, a11y | 5 | M/S |
| **EP-08** | App móvil — base | Uso en obra, offline (Fase 1.5) | 5 | S |

**Total MVP: ~45 historias** · ~35 son *Must/Should* para el primer release web.

---

## 3. Historias del MVP

### EP-00 · Fundación técnica

> Habilitadores. Ver estado en `docs/ESTADO.md`.

| ID | Historia | Prio | Est. |
|----|----------|------|------|
| HU-00.1 | Como **equipo**, quiero el monorepo instalando y compilando sin errores, para desarrollar sobre una base estable. | M | 3 · ✅ hecho |
| HU-00.2 | Como **equipo**, quiero la conexión a PostgreSQL y Redis desde variables de entorno, para que los servicios accedan a datos. | M | 3 |
| HU-00.3 | Como **equipo**, quiero los modelos Sequelize y migraciones base (`User`, `Project`, `ProjectCalculation`, `Material`, `Provider`, `MaterialPrice`, `CalculatorType`), para persistir el dominio. | M | 8 |
| HU-00.4 | Como **equipo**, quiero middleware homogéneo de validación (Joi) y manejo de errores, para respuestas de API consistentes. | M | 3 |
| HU-00.5 | Como **equipo**, quiero seeds con proveedores y materiales reales de Nariño, para probar cálculos con precios verosímiles. | S | 5 |

**HU-00.3 — Criterios de aceptación**

- **Dado** el esquema de `ARCHITECTURE.md`, **cuando** ejecuto `npm run migrate --workspace=construapp-backend`, **entonces** se crean todas las tablas con sus relaciones.
- **Cuando** corro migraciones dos veces, **entonces** la segunda no falla ni duplica (idempotencia).
- **Entonces** cada migración tiene su `down`.

---

### EP-01 · Autenticación y gestión de cuentas

**Trazabilidad:** `POST /api/auth/register|login|refresh` · tabla `Users` · Roadmap Fase 1 › Autenticación.

| ID | Historia | Prio | Est. |
|----|----------|------|------|
| HU-01.1 | Como **P1/P2/P3**, quiero registrarme con correo y contraseña e indicar mi tipo de perfil, para tener una cuenta con interfaz adaptada. | M | 3 |
| HU-01.2 | Como **usuario registrado**, quiero iniciar sesión, para acceder a mis proyectos. | M | 3 |
| HU-01.3 | Como **usuario**, quiero que mi sesión se renueve con un *refresh token* (con rotación), para no volver a iniciar sesión constantemente. | M | 5 |
| HU-01.4 | Como **usuario no autenticado**, quiero que las secciones privadas me redirijan al login (y me devuelvan a donde iba), para que nadie vea datos ajenos. | M | 2 |
| HU-01.5 | Como **usuario autenticado**, quiero cerrar sesión, para proteger mi cuenta en equipos compartidos. | M | 1 |
| HU-01.6 | Como **usuario**, quiero recuperar mi contraseña por correo, para no perder el acceso. | S | 5 |
| HU-01.7 | Como **usuario autenticado**, quiero editar mi perfil y cambiar mi contraseña, para mantener mi información y seguridad. | S | 3 |

**HU-01.1 — Registro**

- **Dado** un correo no registrado y contraseña ≥ 8 caracteres, **cuando** envío `POST /api/auth/register` con `email`, `password`, `name`, `userType`, **entonces** recibo `201` con el usuario (sin contraseña) y la contraseña se guarda con *hash* bcrypt.
- **Dado** un correo ya registrado, **entonces** recibo `400` `{"error":"Email ya existe"}`.
- **Dado** contraseña débil o `userType` inválido, **entonces** `400` con el detalle del campo.

**HU-01.2 — Login**

- **Dado** credenciales válidas, **cuando** envío `POST /api/auth/login`, **entonces** recibo `200` con `token`, `refreshToken`, `user`, `expiresIn`.
- **Dado** credenciales inválidas, **entonces** `401` genérico (sin revelar qué campo falló).
- **Entonces** tras varios intentos fallidos desde una IP, el *rate limiter* responde `429`.

**HU-01.3 — Refresh token**

- **Dado** un `refreshToken` válido, **cuando** llamo `POST /api/auth/refresh`, **entonces** recibo `token` y `refreshToken` nuevos; el anterior queda invalidado.
- **Dado** un `refreshToken` ya usado, **entonces** `401` y se invalida toda la familia de tokens de esa sesión.
- **Dado** un `token` expirado en el frontend, **entonces** se intenta un refresh transparente una sola vez antes de mandar al login.

**HU-01.4 — Rutas protegidas**

- **Dado** que no tengo sesión, **cuando** abro `/dashboard`, `/projects`, `/calculators` o `/providers`, **entonces** voy a `/login` y, al entrar, vuelvo a la URL original.
- **Entonces** el backend rechaza con `401` cualquier endpoint protegido sin `Authorization: Bearer`.

---

### EP-02 · Motor de cálculo de materiales

**Trazabilidad:** `GET /api/calculators/types`, `POST /api/calculators/concrete|brick|mortar` · tablas `CalculatorTypes`, `Materials`, `MaterialPrices` · Roadmap Fase 1 › Calculadoras.

| ID | Historia | Prio | Est. |
|----|----------|------|------|
| HU-02.1 | Como **P1**, quiero ver la lista de calculadoras disponibles con sus campos, para elegir la que necesito. | M | 2 |
| HU-02.2 | Como **P2**, quiero calcular el hormigón de una losa/zapata (largo, ancho, espesor), para saber cuánto cemento, arena y grava comprar. | M | 8 |
| HU-02.3 | Como **P2**, quiero calcular ladrillos y mortero de un muro (área, tipo de ladrillo), para hacer la lista de compra. | M | 8 |
| HU-02.4 | Como **P2**, quiero calcular el mortero de pega/revoque (área, espesor), para dosificar cemento y arena. | M | 5 |
| HU-02.5 | Como **P1**, quiero ver el resultado como desglose de materiales con cantidad, unidad y costo estimado con precios locales (COP), para entenderlo y saber cuánto dinero necesito. | M | 5 |
| HU-02.6 | Como **usuario**, quiero que el formulario valide entradas (números positivos, obligatorios), para no obtener resultados sin sentido. | M | 2 |
| HU-02.7 | Como **P3**, quiero ajustar el % de desperdicio (5–10 % por defecto), para que la compra contemple pérdidas reales. | S | 2 |
| HU-02.8 | Como **usuario autenticado**, quiero guardar un cálculo dentro de un proyecto, para conservarlo y sumarlo al presupuesto. | M | 3 |
| HU-02.9 | Como **P1**, quiero ver, por material, el precio de 2–3 proveedores y cuál es el más barato, para decidir dónde comprar. | S | 5 |
| HU-02.10 | Como **P6 (visitante)**, quiero usar una calculadora básica sin registrarme (sin guardar), para probar la app. | S | 3 |
| HU-02.11 | Como **P3**, quiero un modo avanzado con dosificaciones configurables (cemento:arena:grava, f'c), para cálculos técnicos. | S | 5 |
| HU-02.12 | Como **P2**, quiero una calculadora de pintura (área, manos, rendimiento), para presupuestar acabados. | C | 5 |

**HU-02.2 — Calcular hormigón**

- **Dado** `length`, `width`, `height` en metros y (opcional) `pricePerCubicMeter`, **cuando** envío `POST /api/calculators/concrete`, **entonces** recibo `volume` (m³) y `materials[]` con cemento (sacos), arena (m³) y grava (m³), cada uno con `quantity`, `unit`, `pricePerUnit`, `totalPrice`, `provider`.
- **Entonces** `volume = length × width × height` (2 decimales); las cantidades aplican la dosificación por defecto documentada + el `% desperdicio`.
- **Entonces** `totalCost` = suma de `totalPrice`.
- **Dado** cualquier dimensión ≤ 0 o faltante, **entonces** `400` con `details` por campo.
- **Dado** que no hay precio para un material, **entonces** aparece con `pricePerUnit: null` y "sin precio disponible" (no rompe el cálculo).

**HU-02.5 — Resultado y costo**

- **Entonces** cada precio proviene de `MaterialPrices` (proveedor local de Nariño), no de un valor fijo en código.
- **Dado** varios proveedores para el mismo material, **entonces** por defecto se usa el más barato disponible.
- **Entonces** los montos se muestran en **COP** con separador de miles y el resultado incluye `timestamp` ISO-8601.

**HU-02.8 — Guardar en proyecto**

- **Dado** un resultado y un proyecto propio, **cuando** pulso "Guardar en proyecto" (`POST /api/projects/:projectId/calculations`), **entonces** el cálculo queda asociado y el presupuesto del proyecto se actualiza.
- **Dado** que no soy dueño del proyecto, **entonces** `403`.

---

### EP-03 · Proyectos y presupuestos

**Trazabilidad:** `POST/GET /api/projects`, `GET/PATCH/DELETE /api/projects/:id` · tablas `Projects`, `ProjectCalculations` · Roadmap Fase 1 › Proyectos.

| ID | Historia | Prio | Est. |
|----|----------|------|------|
| HU-03.1 | Como **P1**, quiero crear un proyecto (nombre, descripción, ubicación, presupuesto objetivo, fechas), para agrupar los cálculos de una obra. | M | 3 |
| HU-03.2 | Como **P1**, quiero ver la lista de mis proyectos con su estado y presupuesto, para retomarlos. | M | 2 |
| HU-03.3 | Como **P1**, quiero abrir el detalle de un proyecto y ver todos sus cálculos, para revisar la obra completa. | M | 3 |
| HU-03.4 | Como **P1**, quiero editar y eliminar un proyecto, para corregir datos o limpiar los que no uso. | M | 3 |
| HU-03.5 | Como **P1**, quiero ver el presupuesto acumulado (suma de todos los cálculos) y compararlo con mi presupuesto objetivo (% consumido), para saber si me estoy pasando. | M | 5 |
| HU-03.6 | Como **P3**, quiero eliminar o editar un cálculo dentro del proyecto, para mantener el presupuesto actualizado. | S | 3 |
| HU-03.7 | Como **P1**, quiero cambiar el estado del proyecto (planificación / en progreso / finalizado), para organizar mi trabajo. | S | 2 |

**HU-03.1 — Crear proyecto**

- **Dado** que estoy autenticado, **cuando** envío `POST /api/projects` con al menos `name`, **entonces** recibo `201` con `status: "planning"`, `createdBy` = mi id, `createdAt`.
- **Dado** `budget` negativo o `endDate < startDate`, **entonces** `400`.
- **Entonces** el proyecto solo es visible para su creador (y `admin`).

**HU-03.2 / HU-03.5 — Listar y presupuestar**

- **Dado** 0 proyectos, **entonces** veo un estado vacío con acción "Crear proyecto".
- **Dado** un proyecto con N cálculos, **cuando** abro su detalle, **entonces** veo `totalCost` = suma de los cálculos y `totalCalculations` = N.
- **Cuando** agrego o elimino un cálculo, **entonces** el total se recalcula sin recargar.
- **Entonces** nunca aparecen proyectos de otros usuarios.

---

### EP-04 · Proveedores y precios locales

**Trazabilidad:** `GET /api/providers`, `GET /api/providers/:id/prices` · tablas `Providers`, `Materials`, `MaterialPrices`.

| ID | Historia | Prio | Est. |
|----|----------|------|------|
| HU-04.1 | Como **P1**, quiero ver la lista de proveedores locales de Nariño, para saber a quién comprar. | M | 3 |
| HU-04.2 | Como **P2**, quiero filtrar proveedores por material, ubicación y calificación mínima, para encontrar el adecuado. | S | 3 |
| HU-04.3 | Como **P1**, quiero abrir la ficha de un proveedor (contacto, materiales, tiempo de entrega, calificación), para contactarlo. | M | 3 |
| HU-04.4 | Como **P1**, quiero ver los precios actuales de un proveedor con su fecha de actualización, para comparar. | M | 3 |

**HU-04.1 / HU-04.2**

- **Dado** `GET /api/providers` sin filtros, **entonces** recibo `providers[]` (id, name, location, phone, email, rating, materialsOffered, deliveryTime) y `total`.
- **Dado** `?materialType=concrete&location=Pasto&rating=4`, **entonces** solo se devuelven los que cumplen los tres filtros.
- **Entonces** el listado es visible también para **P6 (visitante)**.

---

### EP-12 · Back-office mínimo

| ID | Historia | Prio | Est. |
|----|----------|------|------|
| HU-12.1 | Como **P5 (admin)**, quiero administrar el catálogo de materiales (crear/editar unidad y categoría), para mantenerlo. | M | 5 |
| HU-12.2 | Como **P5**, quiero cargar y actualizar manualmente los precios de materiales por proveedor, para tener datos reales en el MVP (sistema de precios manual del roadmap). | M | 5 |
| HU-12.3 | Como **P5**, quiero listar y suspender usuarios, para moderar la plataforma. | S | 3 |

---

### EP-13 · Calidad y experiencia transversal

| ID | Historia | Prio | Est. |
|----|----------|------|------|
| HU-13.1 | Como **usuario**, quiero que toda la interfaz sea responsive (móvil/tablet/desktop), para usarla en cualquier dispositivo. | M | 5 |
| HU-13.2 | Como **usuario**, quiero estados de carga y mensajes de error claros en cada acción, para saber qué está pasando. | M | 3 |
| HU-13.3 | Como **equipo**, quiero un pipeline CI (GitHub Actions) que corra `lint + typecheck + test + build` en cada PR, para no romper la rama principal. | M | 3 |
| HU-13.4 | Como **usuario con lector de pantalla**, quiero que la app cumpla WCAG 2.1 AA (foco visible, etiquetas, contraste), para poder usarla. | S | 5 |
| HU-13.5 | Como **equipo**, quiero cobertura de pruebas del backend acorde al roadmap (≥ 85 %), para desplegar con confianza. | S | 8 |

> Ya implementado y solo por verificar/documentar: *health checks* (`/api/health`, `/api/status`),
> *rate limiting*, Helmet y CORS.

---

### EP-08 · App móvil — base (Fase 1.5)

**Trazabilidad:** Roadmap Fase 1 › Mobile · `mobile/` (Expo SDK 50 + expo-router).

| ID | Historia | Prio | Est. |
|----|----------|------|------|
| HU-08.1 | Como **P2 en obra**, quiero una app móvil con navegación a Inicio, Calculadoras, Proyectos y Perfil, para usarla desde el celular. | S | 5 |
| HU-08.2 | Como **P2**, quiero las calculadoras de hormigón/ladrillo/mortero en el móvil, para calcular en el sitio. | S | 8 |
| HU-08.3 | Como **P2**, quiero iniciar sesión y registrarme desde el móvil, para tener mis proyectos sincronizados. | S | 5 |
| HU-08.4 | Como **P2 sin señal**, quiero que mis cálculos y proyectos se guarden localmente (SQLite) y se sincronicen al recuperar conexión, para no perder trabajo. | S | 13 |
| HU-08.5 | Como **P2**, quiero un indicador de "sin conexión" y de "cambios pendientes de subir", para saber el estado. | C | 2 |

---

## 4. Propuesta de sprints para el MVP

> Sprints de 2 semanas. Alineado con la tabla "Asignación de Tareas Actuales" del `ROADMAP.md`.

| Sprint | Objetivo | Historias |
|--------|----------|-----------|
| **S0** | Fundación | HU-00.1 ✅, HU-00.2, HU-00.3, HU-00.4 |
| **S1** | Autenticación de punta a punta | HU-00.5, HU-01.1, HU-01.2, HU-01.3, HU-01.4, HU-01.5 |
| **S2** | Primera calculadora con costo real | HU-01.7, HU-02.1, HU-02.2, HU-02.5, HU-02.6, HU-04.1, HU-12.1, HU-12.2 |
| **S3** | Proyectos + guardar cálculos | HU-02.8, HU-03.1, HU-03.2, HU-03.3, HU-03.5, HU-04.3, HU-04.4 |
| **S4** | Completar calculadoras MVP + comparativa | HU-02.3, HU-02.4, HU-02.7, HU-02.9, HU-02.11, HU-03.4, HU-03.6, HU-04.2 |
| **S5** | Robustez y verificación | HU-01.6, HU-02.10, HU-13.1, HU-13.2, HU-13.3, HU-13.5, HU-12.3, HU-03.7 |
| **S6** | Base móvil (Fase 1.5) | HU-08.1, HU-08.2, HU-08.3, HU-08.4 |

**Criterios de aceptación del MVP (`ROADMAP.md`):** un usuario puede registrarse,
iniciar sesión, hacer cálculos, guardarlos en un proyecto, ver proveedores locales
y usar la interfaz en móvil; backend con ≥ 85 % de cobertura.

---

## 5. Fases 2–4 — a nivel de épica

> Solo el título y el objetivo. Las historias se redactarán al acercarse cada fase
> (evita mantener decenas de historias que aún cambiarán).

### Fase 2 — Expansión

| Épica | Objetivo | Fuente `ROADMAP.md` |
|-------|----------|---------------------|
| **EP-05 · Reportes y exportación** | Cotización a PDF, presupuesto a Excel, reporte de consumo, análisis de tendencia de costos, recomendaciones automáticas. | Fase 2 › Análisis y Reportes |
| **EP-06 · Portal de proveedores** | Alta de proveedor, publicación/actualización de precios, disponibilidad, calificaciones y reseñas, panel de métricas, pedidos al por mayor. | Fase 2 › Integración de Proveedores |
| **EP-07 · Sostenibilidad** | Huella de carbono por material, alternativas eco, reducción de desperdicio, reporte de sostenibilidad, distintivo "proveedor verde". | Fase 2 › Sostenibilidad |
| **EP-18 · Rendimiento y escalabilidad** | Caché de precios con Redis + invalidación, índices de BD, compresión de respuestas, CDN e imágenes optimizadas (objetivo < 2 s de API). | Fase 2 › Mejoras de Performance |

### Fase 3 — Consolidación

| Épica | Objetivo | Fuente `ROADMAP.md` |
|-------|----------|---------------------|
| **EP-09 · Monetización** | Plan gratuito con límites, suscripción Premium (MercadoPago/Stripe), historial de pagos y facturas, gestión de suscripción, reembolsos, comisión por proveedor referido. | Fase 3 › Sistema de Pagos |
| **EP-10 · Notificaciones y alertas** | Aviso por cambio de precio de un material seguido, recordatorios de proyecto, alertas por correo, push en móvil, preferencias de notificación. | Fase 3 › Notificaciones en Tiempo Real |
| **EP-11 · Inteligencia y recomendaciones** | Recomendación de materiales por tipo de obra, predicción de precios, detección de anomalías, chatbot de soporte, OCR de cotizaciones. | Fase 3 › Inteligencia Artificial |
| **EP-17 · Integraciones con terceros** | Google Maps (proveedor más cercano), Weather API (cálculo ajustado por clima), conectores con software contable / ERP. | Fase 3 › Integración con Terceros |
| **EP-19 · Métricas de plataforma** | Panel con los KPIs del roadmap (usuarios, MAU, cálculos/mes, proveedores). | Fase 3 |

### Fase 4 — Escala

| Épica | Objetivo | Fuente `ROADMAP.md` |
|-------|----------|---------------------|
| **EP-14 · Expansión regional** | Otros departamentos de Colombia, Ecuador y Perú, multi-moneda, i18n, precios regionalizados. | Fase 4 › Expansión Geográfica |
| **EP-15 · Business Intelligence** | Dashboard de analítica, tendencias de mercado, monitoreo de precios de competencia, pronóstico de demanda. | Fase 4 › Business Intelligence |
| **EP-16 · Marketplace** | Alquiler de equipos, mano de obra, intercambio de materiales, licitación de proyectos. | Fase 4 › Marketplace |

---

## 6. Matriz de trazabilidad (MVP)

| Historia | Endpoint(s) `API.md` | Tabla(s) `ARCHITECTURE.md` | Ítem `ROADMAP.md` |
|----------|----------------------|---------------------------|-------------------|
| HU-01.1 | `POST /api/auth/register` | `Users` | Fase 1 › Autenticación |
| HU-01.2 | `POST /api/auth/login` | `Users` | Fase 1 › Autenticación |
| HU-01.3 | `POST /api/auth/refresh` | `Users` (+ refresh tokens) | Fase 1 › Refresh token rotation |
| HU-02.1 | `GET /api/calculators/types` | `CalculatorTypes` | Fase 1 › API Endpoints |
| HU-02.2 | `POST /api/calculators/concrete` | `Materials`, `MaterialPrices`, `Providers` | Fase 1 › Concrete calculator |
| HU-02.3 | `POST /api/calculators/brick` | `Materials`, `MaterialPrices` | Fase 1 › Brick calculator |
| HU-02.4 | `POST /api/calculators/mortar` | `Materials`, `MaterialPrices` | Fase 1 › Mortar calculator |
| HU-02.8 | `POST /api/projects/:id/calculations` | `ProjectCalculations` | Fase 1 › Calculations storage |
| HU-03.1 | `POST /api/projects` | `Projects` | Fase 1 › Project model |
| HU-03.3 | `GET /api/projects/:id` | `Projects`, `ProjectCalculations` | Fase 1 › Project details |
| HU-04.1 | `GET /api/providers` | `Providers` | Fase 1 › Providers data |
| HU-04.4 | `GET /api/providers/:id/prices` | `MaterialPrices` | Fase 1 › GET /providers |

---

## 7. Riesgos y supuestos

- **Datos de precios**: el valor de la app depende de tener precios locales reales.
  Si no hay proveedores cargados, priorizar HU-00.5 y HU-12.2 antes que cualquier
  funcionalidad "en tiempo real".
- **Fórmulas de cálculo**: las dosificaciones (hormigón, mortero) deben validarse con
  un ingeniero civil local antes de S2 y documentarse en `docs/` como fuente única.
- **`userType` vs. RBAC**: `API.md` usa `contractor/provider/admin`; `ARCHITECTURE.md`
  usa `admin/provider/user/guest`. Unificar la nomenclatura en HU-00.3 / HU-01.1.
- **Verificación de correo**: requiere SMTP (previsto en `.env.example`). Si no está
  listo, no debe bloquear el login.
- **Alcance móvil**: la lógica de cálculo vive en el backend; el móvil solo consume la
  API y cachea. No reimplementar fórmulas en el cliente.
