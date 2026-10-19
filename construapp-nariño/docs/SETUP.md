# 📖 Guía de Instalación - ConstruApp Nariño

## Requisitos Previos

Asegúrate de tener instalado lo siguiente:

- **Node.js** >= 18.0.0 ([Descargar](https://nodejs.org/)) - probado con Node 20/22
- **npm** >= 9.0.0 (el monorepo usa npm workspaces)
- **PostgreSQL** >= 14 ([Descargar](https://www.postgresql.org/download/))
- **Redis** >= 6.0 ([Descargar](https://redis.io/download/)) (Opcional para desarrollo)
- **Git** ([Descargar](https://git-scm.com/))
- **Docker** (Opcional para ejecutar con contenedores)

### Verificar Instalación

```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar PostgreSQL
psql --version
```

## 🚀 Instalación Rápida (Windows/Mac/Linux)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tuusuario/construapp-nariño.git
cd construapp-nariño
```

### 2. Instalar todas las dependencias

Desde la raíz del monorepo (instala backend, frontend y mobile a la vez):

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo .env.example a .env (desde la raíz del repo)
cp backend/.env.example backend/.env

# En Windows (PowerShell): Copy-Item backend/.env.example backend/.env
# Editar backend/.env con tus configuraciones
```

El `backend/.env.example` ya trae valores que funcionan con el `docker-compose`
(Postgres en el puerto **5433**, Redis en **6380** del host, para no chocar con
un PostgreSQL local en 5432). Solo cambia `JWT_SECRET` para tu entorno.

### 4. Levantar la base de datos

**Opción A — Docker (recomendada, sin instalar nada):**

```bash
docker compose up -d postgres redis
```

Crea automáticamente la base `construapp_narino` y el usuario `construapp_user`.

**Opción B — PostgreSQL propio en el 5432:** crea la base y el usuario a mano y
pon `DB_PORT=5432` en `backend/.env`.

**Opción C — sin base de datos:** `DB_DIALECT=sqlite` en `backend/.env` usa un
archivo local (`backend/data/construapp.sqlite`), sin infraestructura.

### 5. Ejecutar Migraciones y Seed

```bash
npm run migrate --workspace=construapp-backend   # crea las 7 tablas
npm run seed --workspace=construapp-backend       # catálogo de Nariño (opcional)
```

### 6. Iniciar los Servicios

```bash
# Todo a la vez, desde la raíz del monorepo
npm run dev

# O por separado:
npm run dev:backend    # http://localhost:5000
npm run dev:frontend   # http://localhost:3000
npm run dev:mobile     # Expo (Metro bundler)
```

## 🐳 Instalación con Docker (Alternativa)

Si prefieres usar Docker, sigue estos pasos:

### 1. Instalar Docker

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### 2. Compilar Imágenes

```bash
docker-compose build
```

### 3. Ejecutar Contenedores

```bash
docker-compose up
```

Los servicios estarán disponibles en:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- PostgreSQL: localhost:5433  (5432 dentro de la red de Docker)
- Redis: localhost:6380  (6379 dentro de la red de Docker)

### 4. Detener Contenedores

```bash
docker-compose down
```

## ✅ Verificar Instalación

Abre tu navegador y verifica:

1. **Backend Health Check**
   - URL: http://localhost:5000/api/health
   - Deberías ver: `{"status": "ok", ...}`

2. **Frontend**
   - URL: http://localhost:3000
   - Deberías ver la página de inicio

3. **API Status**
   - URL: http://localhost:5000/api/status
   - Deberías ver el estado del servidor

## 🔧 Solución de Problemas

### Error: "Port already in use"

```bash
# En Windows (PowerShell)
netstat -ano | findstr :5000
taskkill /PID XXXXX /F

# En Mac/Linux
lsof -i :5000
kill -9 XXXXX
```

### Error: "Cannot connect to database"

1. Verifica que PostgreSQL esté corriendo
2. Verifica las credenciales en `.env`
3. Asegúrate de haber creado la base de datos

```bash
# Verificar conexión PostgreSQL
psql -U postgres -h localhost
```

### Las dependencias no se instalan correctamente

```bash
# Limpiar e reinstalar desde la raíz
rm -rf node_modules package-lock.json
npm install
```

> El monorepo usa **npm workspaces**. Ejecuta `npm install` una sola vez desde
> la raíz; no corras `npm install` dentro de `backend/`, `frontend/` o `mobile/`.

## 📚 Estructura de Carpetas Después de la Instalación

```
construapp-nariño/
├── node_modules/       # Dependencias compartidas (hoisted por npm workspaces)
├── package-lock.json   # Lockfile único del monorepo (versionado)
├── backend/
│   ├── src/
│   ├── dist/           # Compilado (npm run build)
│   ├── logs/           # Logs del servidor (auto-creado)
│   └── package.json
├── frontend/
│   ├── src/
│   ├── dist/           # Build optimizado (npm run build)
│   └── package.json
├── mobile/
│   ├── app/            # Rutas de expo-router
│   └── package.json
└── docs/
```

## 🔑 Variables de Entorno Importantes

| Variable | Descripción | Por Defecto |
|----------|-------------|------------|
| `NODE_ENV` | Ambiente (development/production) | development |
| `PORT` | Puerto del servidor | 5000 |
| `DB_DIALECT` | `postgres` o `sqlite` | postgres |
| `DB_HOST` | Host de la base de datos | localhost |
| `DB_PORT` | Puerto de PostgreSQL (host) | 5433 |
| `JWT_SECRET` | Secreto para tokens JWT | (Debe configurarse) |
| `REDIS_HOST` | Host de Redis | localhost |
| `REDIS_PORT` | Puerto de Redis (host) | 6380 |

## 📝 Próximos Pasos

1. Lee [ARCHITECTURE.md](./ARCHITECTURE.md) para entender la estructura
2. Consulta [API.md](./API.md) para la documentación de endpoints
3. Revisa [DEPLOYMENT.md](./DEPLOYMENT.md) para despliegue en producción

## 🆘 ¿Necesitas Ayuda?

- 📧 Email: support@construappnariño.com
- 💬 Discord: [Join our community](https://discord.gg/construapp)
- 📱 Issues: [GitHub Issues](https://github.com/tuusuario/construapp-nariño/issues)

---

¡Bienvenido a ConstruApp Nariño! 🎉
