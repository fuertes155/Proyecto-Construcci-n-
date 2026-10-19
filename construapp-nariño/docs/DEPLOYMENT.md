# 🚢 Guía de Despliegue — ConstruApp Nariño

> Estado: **borrador mínimo**. Cubre solo el despliegue local con Docker que ya
> existe en el repo. Ampliar cuando se defina el proveedor de hosting (AWS /
> DigitalOcean / Render, etc.).

---

## Componentes

| Servicio | Imagen / build | Puerto | Notas |
|----------|----------------|--------|-------|
| `backend` | `backend/Dockerfile` (multi-stage, `npm ci` + `tsc`) | 5000 | API REST |
| `frontend` | `frontend/Dockerfile` (build Vite + `serve`) | 3000 | SPA estática |
| `postgres` | `postgres:15-alpine` | 5432 | BD `construapp_narino` |
| `redis` | `redis:7-alpine` | 6379 | caché de precios |
| `pgadmin` | `dpage/pgadmin4` | 5050 | solo desarrollo |

Ambos Dockerfiles usan **contexto en la raíz del repo** (necesitan
`package.json` + `package-lock.json` + los `package.json` de cada workspace para
`npm ci`). Esto ya está configurado en `docker-compose.yml`
(`build.context: .`, `build.dockerfile: backend/Dockerfile`).

---

## Local con Docker Compose

```bash
# Desde la raíz del repo
docker compose build
docker compose up -d

# Logs
docker compose logs -f backend

# Parar
docker compose down            # conserva volúmenes
docker compose down -v         # borra datos de postgres/redis
```

Servicios:
- API:      http://localhost:5000/api/health
- Web:      http://localhost:3000
- PgAdmin:  http://localhost:5050  (admin@construapp.local / admin123)

### Variables de entorno

`docker-compose.yml` toma valores de un `.env` en la raíz (opcional):

```env
NODE_ENV=production
DB_PASSWORD=cambia_esto
JWT_SECRET=cambia_esto
```

Para desarrollo local sin Docker, el backend usa `backend/.env`
(ver `backend/.env.example`).

---

## Build de imágenes por separado

```bash
docker build -f backend/Dockerfile  -t construapp-backend  .
docker build -f frontend/Dockerfile -t construapp-frontend .
```

---

## Pendiente para producción real

- [ ] Registro de imágenes (GHCR / ECR / Docker Hub).
- [ ] Pipeline CI/CD en `.github/workflows/` (build + test + push).
- [ ] Postgres gestionado + backups; Redis gestionado.
- [ ] Reverse proxy / TLS (Caddy, Nginx o el del proveedor).
- [ ] Migraciones automáticas en el arranque del backend
      (`npm run migrate` antes de `node dist/index.js`).
- [ ] Healthchecks y límites de recursos en el orquestador.
- [ ] Separar `pgadmin` a un perfil de compose solo-desarrollo.
