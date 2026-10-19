# 🏗️ ConstruApp Nariño

**Aplicación de Cálculo de Materiales de Construcción para el Mercado Local de Nariño, Colombia**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-En%20Desarrollo-yellow)

## 📋 Descripción

ConstruApp Nariño es una solución integral diseñada para ayudar a profesionales, maestros de obra y propietarios en el cálculo preciso de materiales de construcción. La aplicación integra precios en tiempo real del mercado local de Nariño, proporcionando herramientas de presupuestación, minimización de desperdicios y optimización de costos.

## 🎯 Características Principales

### ✅ Funcionalidades Core
- **Calculadoras Especializadas**
  - Cálculo de hormigón/concreto (volumen, proporción, consumo)
  - Cálculo de mampostería (ladrillos, bloques, mortero)
  - Cálculo de estructuras (acero, madera, encofrado)
  - Cálculo de acabados (pintura, baldosas, revoque)
  - Cálculo de instalaciones (tuberías, cableado eléctrico)

- **Precios en Tiempo Real**
  - Base de datos de proveedores locales de Nariño
  - Actualización diaria de precios
  - Comparativa de precios entre proveedores
  - Historial de variación de precios

- **Gestión de Proyectos**
  - Creación de múltiples proyectos
  - Presupuestos personalizados
  - Generación de reportes y cotizaciones PDF/Excel
  - Historial de proyectos

### 👥 Interfaces Adaptadas
- **Para Ingenieros/Arquitectos**: Herramientas avanzadas, análisis técnicos
- **Para Maestros de Obra**: Interfaz simplificada, tutoriales visuales
- **Para Propietarios**: Presupuestos claros, comparativas

## 🚀 Tecnologías

### Backend
- **Node.js** con Express.js
- **PostgreSQL** para base de datos estructurada
- **Redis** para caché de precios
- **JWT** para autenticación

### Frontend
- **React** con Vite
- **TypeScript** para type safety
- **Tailwind CSS** para estilos
- **React Query** para manejo de estado

### Mobile
- **React Native** / **Expo**
- Soporte offline
- Funcionalidad multiplataforma (iOS/Android)

### DevOps
- **Docker** para containerización
- **GitHub Actions** para CI/CD
- **AWS/DigitalOcean** para hosting

## 📁 Estructura del Proyecto

```
construapp-nariño/
├── backend/                 # API REST Node.js/Express
│   ├── src/
│   │   ├── routes/         # Rutas de API
│   │   ├── controllers/    # Controladores de lógica
│   │   ├── models/         # Modelos de base de datos
│   │   ├── services/       # Servicios de negocio
│   │   ├── middleware/     # Middleware personalizado
│   │   ├── config/         # Configuraciones
│   │   └── utils/          # Utilidades
│   ├── tests/              # Tests del backend
│   ├── package.json
│   └── .env.example
│
├── frontend/               # Aplicación React Web
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas principales
│   │   ├── services/      # Servicios API
│   │   ├── hooks/         # Hooks personalizados
│   │   ├── context/       # Context API
│   │   ├── styles/        # Estilos globales
│   │   └── utils/         # Funciones utilitarias
│   ├── public/            # Archivos estáticos
│   ├── package.json
│   └── vite.config.ts
│
├── mobile/                 # Aplicación React Native (Expo SDK 50)
│   ├── app/              # Rutas de expo-router
│   ├── app.json           # Configuración Expo
│   ├── babel.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── docs/                   # Documentación
│   ├── ESTADO.md         # Estado actual del proyecto + próximos pasos
│   ├── API.md             # Documentación de API
│   ├── SETUP.md           # Guía de instalación
│   ├── ARCHITECTURE.md    # Arquitectura del sistema
│   ├── ROADMAP.md         # Fases de desarrollo
│   └── DEPLOYMENT.md      # Guía de despliegue (borrador)
│
├── config/                 # Archivos de configuración (vacío por ahora)
│
├── docker-compose.yml
├── .gitignore
├── package.json           # Monorepo root (npm workspaces)
├── package-lock.json      # Lockfile versionado
└── README.md             # Este archivo
```

## 🔧 Instalación Rápida

### Requisitos Previos
- Node.js >= 18.0.0 (probado con Node 20/22)
- npm >= 9 (el monorepo usa **npm workspaces**)
- Git
- PostgreSQL 14+ (opcional hasta que se implemente la capa de datos)
- Docker (opcional)

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/tuusuario/construapp-nariño.git
cd construapp-nariño
```

2. **Instalar dependencias** (una sola vez, desde la raíz)
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp backend/.env.example backend/.env
# Editar backend/.env con tus configuraciones
```

4. **Ejecutar migraciones de base de datos** (aún sin migraciones definidas)
```bash
npm run migrate --workspace=construapp-backend
```

5. **Iniciar los servicios**
```bash
# Todo a la vez, desde la raíz
npm run dev

# O por separado:
npm run dev:backend    # http://localhost:5000
npm run dev:frontend   # http://localhost:3000
npm run dev:mobile     # Expo
```

## 📖 Documentación

- [Estado del Proyecto](./docs/ESTADO.md) - Estado real actual y próximos pasos
- [Progreso del MVP](./docs/PROGRESO-MVP.md) - Checklist vivo de historias
- [Historias de Usuario](./docs/HISTORIAS-DE-USUARIO.md) - Épicas y backlog ágil
- [API Documentation](./docs/API.md) - Documentación completa de endpoints
- [Setup Guide](./docs/SETUP.md) - Guía de instalación detallada
- [Architecture](./docs/ARCHITECTURE.md) - Diseño de la arquitectura
- [Roadmap](./docs/ROADMAP.md) - Fases de desarrollo
- [Deployment](./docs/DEPLOYMENT.md) - Guía de despliegue (borrador)

## 🤝 Características por Fase

### Fase 1: MVP (Meses 1-6)
- ✅ Calculadoras básicas
- ✅ Base de datos de proveedores
- ✅ Interfaz web y móvil
- ✅ Sistema de precios manual
- ✅ Autenticación básica

### Fase 2: Expansión (Meses 7-9)
- 🔄 Actualización automática de precios
- 🔄 Herramientas avanzadas
- 🔄 Generación de reportes PDF
- 🔄 Programa de asociaciones

### Fase 3: Consolidación (Meses 10-15)
- 📅 API para integración empresarial
- 📅 Módulo de gestión de proyectos
- 📅 Análisis de sostenibilidad
- 📅 Expansión regional

## 💰 Modelo de Negocio

- **Freemium**: Cálculos básicos gratuitos
- **Premium**: $5-10 USD/mes - Acceso completo
- **Empresarial**: Soluciones personalizadas
- **Comisiones**: Por referral de proveedores

## 🌱 Sostenibilidad

La aplicación promueve prácticas de construcción sostenible:
- Cálculo de huella de carbono por material
- Sugerencias de materiales eco-amigables
- Optimización de desperdicios
- Integración con sellos ambientales (ISO 14001)

## 📊 KPIs de Éxito - Año 1

| Métrica | Meta |
|---------|------|
| Usuarios Registrados | 15,000 |
| Usuarios Activos Mensuales | 5,000 |
| Cálculos Realizados | 50,000/mes |
| Proveedores Integrados | 100 |
| Retención 30 días | 40% |
| NPS Score | 50+ |
| Ingresos Mensuales | $5,000 USD |

## 🛠️ Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte y consultas:
- 📧 Email: support@construappnariño.com
- 💬 Chat: [Discord Community](https://discord.gg/construapp)
- 📱 WhatsApp: +57 XXX XXX XXXX

## 👥 Team

**ConstruApp Nariño** está desarrollado por un equipo dedicado de ingenieros y especialistas en construcción comprometidos con la innovación en el sector.

---

**Hecho con ❤️ para Nariño, Colombia**

Última actualización: Septiembre 2026
