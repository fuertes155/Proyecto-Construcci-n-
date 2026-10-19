# 🏗️ Arquitectura de ConstruApp Nariño

## Vista General

ConstruApp Nariño utiliza una arquitectura **monorepo** con tres aplicaciones independientes pero conectadas:

```
┌─────────────────────────────────────────────────────────────┐
│                    ConstruApp Nariño                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │  Frontend    │    │   Backend    │    │   Mobile     │   │
│  │  (React)     │◄──►│  (Node.js)   │◄──►│ (React Native)  │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                              │                                │
│                              ▼                                │
│                    ┌──────────────────┐                       │
│                    │  PostgreSQL DB   │                       │
│                    │  Redis Cache     │                       │
│                    └──────────────────┘                       │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Integración APIs Externas                   │    │
│  │  • Proveedores de Precios                          │    │
│  │  • Servicios de Clima/Geolocalización              │    │
│  │  • Sistemas de Pago                                │    │
│  │  • Email/SMS                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Componentes de la Aplicación

### 1. Backend (Node.js/Express)

**Responsabilidades:**
- API REST para manejar todas las operaciones
- Autenticación y autorización
- Gestión de base de datos
- Lógica de negocio
- Integración con APIs externas
- Caché con Redis
- Logging y monitoreo

**Estructura:**

```
backend/
├── src/
│   ├── index.ts                 # Punto de entrada
│   ├── routes/                  # Definición de rutas
│   │   ├── calculators.ts
│   │   ├── projects.ts
│   │   ├── providers.ts
│   │   ├── users.ts
│   │   └── auth.ts
│   ├── controllers/             # Lógica de controladores
│   │   ├── calculatorController.ts
│   │   ├── projectController.ts
│   │   ├── providerController.ts
│   │   └── authController.ts
│   ├── models/                  # Modelos Sequelize
│   │   ├── User.ts
│   │   ├── Project.ts
│   │   ├── Material.ts
│   │   ├── Provider.ts
│   │   └── Price.ts
│   ├── services/                # Lógica de negocio
│   │   ├── calculatorService.ts
│   │   ├── priceService.ts
│   │   ├── projectService.ts
│   │   ├── authService.ts
│   │   └── emailService.ts
│   ├── middleware/              # Middleware personalizado
│   │   ├── auth.ts              # Validación JWT
│   │   ├── errorHandler.ts      # Manejo de errores
│   │   ├── validation.ts        # Validación de datos
│   │   └── rateLimiter.ts
│   ├── config/                  # Configuraciones
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── logger.ts
│   │   └── jwt.ts
│   ├── utils/                   # Utilidades
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   ├── calculations.ts
│   │   └── helpers.ts
│   ├── migrations/              # Migraciones DB
│   └── seeds/                   # Datos iniciales
├── tests/
├── package.json
├── tsconfig.json
└── .env.example
```

**Tecnologías principales:**
- Express.js - Framework web
- Sequelize - ORM
- PostgreSQL - Base de datos
- Redis - Caché
- JWT - Autenticación
- Winston - Logging

### 2. Frontend (React/TypeScript)

**Responsabilidades:**
- Interfaz de usuario web
- Autenticación y gestión de sesión
- Formularios y validación
- Consumo de APIs del backend
- Gestión de estado
- Reportes y gráficos

**Estructura:**

```
frontend/
├── src/
│   ├── main.tsx                 # Punto de entrada
│   ├── App.tsx                  # Componente principal
│   ├── components/              # Componentes reutilizables
│   │   ├── Layout/
│   │   ├── Navbar/
│   │   ├── Sidebar/
│   │   ├── Form/
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── Calculator/
│   ├── pages/                   # Páginas de la app
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Calculators.tsx
│   │   ├── Projects.tsx
│   │   ├── Providers.tsx
│   │   ├── Auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   └── Settings.tsx
│   ├── services/                # Servicios API
│   │   ├── api.ts               # Cliente HTTP
│   │   ├── auth.ts
│   │   ├── calculator.ts
│   │   ├── project.ts
│   │   └── provider.ts
│   ├── hooks/                   # Hooks personalizados
│   │   ├── useAuth.ts
│   │   ├── useCalculator.ts
│   │   ├── useForm.ts
│   │   └── useFetch.ts
│   ├── context/                 # Context API
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── AppContext.tsx
│   ├── styles/                  # Estilos globales
│   │   ├── variables.css
│   │   └── theme.css
│   ├── utils/                   # Utilidades
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   ├── types/                   # TypeScript types
│   │   └── index.ts
│   └── index.css
├── public/
├── tests/
├── vite.config.ts
├── tsconfig.json
└── package.json
```

**Tecnologías principales:**
- React 18 - UI library
- TypeScript - Type safety
- Vite - Build tool
- React Router - Navegación
- React Query - Gestión de datos
- Zustand - State management
- Tailwind CSS - Styling

### 3. Mobile (React Native/Expo)

**Responsabilidades:**
- Aplicación nativa para iOS/Android
- Funcionamiento offline
- Notificaciones push
- Acceso a cámara/galería
- Geolocalización

**Estructura:**

```
mobile/
├── src/
│   ├── index.ts
│   ├── screens/                 # Pantallas de la app
│   │   ├── HomeScreen.tsx
│   │   ├── CalculatorScreen.tsx
│   │   ├── ProjectsScreen.tsx
│   │   ├── ProvidersScreen.tsx
│   │   └── AuthScreen.tsx
│   ├── components/              # Componentes
│   │   ├── Header.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Calculator/
│   ├── navigation/              # Stack navigation
│   │   └── Navigation.tsx
│   ├── services/                # Servicios
│   │   ├── api.ts
│   │   ├── storage.ts
│   │   └── notification.ts
│   ├── styles/                  # Estilos
│   │   └── theme.ts
│   └── utils/
├── app.json
└── package.json
```

**Tecnologías principales:**
- React Native - Framework móvil
- Expo - Plataforma de desarrollo
- TypeScript
- React Navigation - Navegación

## Base de Datos

### Esquema Principal

```sql
-- Usuarios
Users(id, email, password, firstName, lastName, role, status, createdAt)

-- Proyectos
Projects(id, userId, name, description, status, budget, createdAt)

-- Cálculos de Proyectos
ProjectCalculations(id, projectId, type, quantity, unit, cost, createdAt)

-- Materiales
Materials(id, name, unit, category, description)

-- Precios de Materiales
MaterialPrices(id, materialId, providerId, price, currency, lastUpdated)

-- Proveedores
Providers(id, name, location, phone, email, rating)

-- Tipos de Cálculos Soportados
CalculatorTypes(id, name, formula, fields, description)
```

### Relaciones

```
Users (1) ──────────── (M) Projects
         └──────────────── (M) ProjectCalculations

Providers (1) ────────── (M) MaterialPrices
                           │
                           └─ (M) Materials

Projects (1) ────────── (M) ProjectCalculations
```

## Flujo de Datos

### 1. Autenticación

```
[Usuario] 
    │ 1. Ingresa credenciales
    ▼
[Frontend: Login]
    │ 2. Envía POST /auth/login
    ▼
[Backend: AuthController]
    │ 3. Valida credenciales
    ├─► Consulta BD
    │ 4. Genera JWT
    ▼
[Frontend: Almacena token]
    │ 5. Token en header de todas las peticiones
    ▼
[Rutas protegidas]
```

### 2. Cálculo de Materiales

```
[Usuario ingresa datos]
    │ (dimensiones, materiales, cantidades)
    ▼
[Frontend: Calculator]
    │ Valida datos
    ▼
[Backend: CalculatorService]
    │ 1. Obtiene precios de caché/BD
    ├─► Si no en caché, consulta proveedores
    │ 2. Aplica fórmulas de cálculo
    │ 3. Calcula costo total
    ▼
[Response con resultados]
    │
    ▼
[Frontend: Muestra resultados]
    │
    ▼
[Usuario: Guarda proyecto]
```

### 3. Actualización de Precios

```
[Proveedor: Reporta precio]
    │ (API endpoint)
    ▼
[Backend: PriceController]
    │ Valida datos
    ▼
[MaterialPrices: Actualiza BD]
    │
    ▼
[Redis: Invalida caché]
    │
    ▼
[Siguiente cálculo: Obtiene precio actualizado]
```

## Seguridad

### Autenticación

- **JWT (JSON Web Tokens)**: Tokens sin estado con expiración
- **Password Hashing**: Bcrypt para almacenar contraseñas
- **Refresh Tokens**: Para renovar sesiones expiradas

### Autorización

- **Role-Based Access Control (RBAC)**
  - Admin: Acceso total
  - Provider: Manage precios
  - User: Acceso a sus propios proyectos
  - Guest: Solo lectura

### Protecciones

- **CORS**: Restringido a dominios autorizados
- **Rate Limiting**: Límite de peticiones por IP
- **HTTPS**: En producción
- **Helmet.js**: Headers de seguridad HTTP
- **Input Validation**: Validación de todos los inputs
- **SQL Injection Prevention**: Parámetros preparados

## Escalabilidad

### Fases de Escalado

**Fase 1: MVP (0-100 usuarios)**
- Single server
- PostgreSQL única
- Redis caché local

**Fase 2: Crecimiento (100-1000 usuarios)**
- Load balancer
- Multiple servidor backend
- PostgreSQL replicada (master-slave)
- Redis cluster

**Fase 3: Escala (1000+ usuarios)**
- Kubernetes orquestación
- Database sharding
- CDN para assets
- Message queue (RabbitMQ)
- Microservicios

## Despliegue

### Archivos de Configuración

- `docker-compose.yml` - Ambiente local
- `Dockerfile` - Imagen para cada servicio
- `.github/workflows/` - CI/CD pipelines
- `k8s/` - Configuración Kubernetes (futuro)

### Ambientes

1. **Development** - Local (esta máquina)
2. **Staging** - Preproducción
3. **Production** - Usuarios reales

## Monitoreo y Logs

### Logging

- **Winston**: Logger principal
- **Files**: Logs guardados localmente
- **Console**: Output en desarrollo
- **Levels**: error, warn, info, http, debug

### Monitoreo

- **Health checks**: `/api/health`
- **Métricas**: Requests, latencia, errores
- **Alertas**: Notificaciones de issues críticos

## API Endpoints

Ver [API.md](./API.md) para la lista completa de endpoints.

---

**Última actualización:** Septiembre 2026
