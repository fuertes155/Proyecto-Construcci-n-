# Despliegue de ConstruApp Nariño

La web compilada y la API se sirven desde un único servicio Node. PostgreSQL guarda usuarios, proyectos y cálculos; Redis es opcional. El despliegue no usa SQLite ni depende de que el computador local esté encendido.

## Configuración de Render

El archivo `render.yaml` está en la raíz Git, un nivel por encima de esta aplicación. Define un servicio web gratuito y PostgreSQL 15 gratuito en Oregon. Es una configuración reproducible para una instalación nueva. Si los recursos se crearon directamente con CLI/API, no quedan enlazados automáticamente a un Blueprint: los cambios posteriores se aplican al servicio existente.

Render no acepta la `ñ` del directorio en el campo `rootDir`. Por eso el directorio raíz del servicio queda vacío y los comandos entran a `construapp-nariño`:

```sh
# Build Command
cd construapp-nariño && npm ci --include=dev --workspace=construapp-backend --workspace=construapp-frontend --include-workspace-root && npm run build:deploy

# Start Command
cd construapp-nariño && npm run start:production
```

El arranque valida la configuración, crea las tablas de forma no destructiva, carga el catálogo y finalmente inicia el servidor. Si se habilita `DEMO_MODE=true`, también crea la cuenta pública de demostración y su obra de tres cálculos. Repetirlo conserva los cambios de esa obra.

## Variables del hosting

| Variable | Valor o propósito |
| --- | --- |
| `NODE_VERSION` | `22.14.0`, versión comprobada para esta entrega |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Conexión **interna** de PostgreSQL en la misma región y workspace |
| `JWT_SECRET` | Valor aleatorio generado por Render, al menos 32 caracteres |
| `DB_DIALECT` | `postgres` |
| `REDIS_ENABLED` | `false` para el despliegue sin caché |
| `TRUST_PROXY` | `1` detrás del proxy de Render |
| `DEMO_MODE` | `true` para la presentación académica |
| `LOG_LEVEL` | `info` |

Render proporciona `PORT` y `RENDER_EXTERNAL_URL`. El servidor escucha en `0.0.0.0` y utiliza esa URL para CORS y enlaces de recuperación. `SERVE_FRONTEND` y la ruta del build los establece el script de producción. No subas `backend/.env` ni copias de la base local al repositorio.

La cuenta pública `demo@construapp.co` / `demo-12345678` tiene rol de usuario y contiene únicamente datos de ejemplo. No almacenes información privada en esa cuenta compartida. Para el uso personal, crea tu propia cuenta. No se crea un administrador con contraseña pública.

## Verificación

- `/api/ready`: debe devolver HTTP 200 y `database: connected`. Es el healthcheck configurado en Render y consulta la base en cada petición.
- `/api/status`: informa el estado del servidor. `cache: disconnected` es normal con Redis deshabilitado.
- `/login` y `/projects/...`: deben abrir directamente y sobrevivir a una recarga.
- Entrar con la cuenta demo, abrir la obra y comprobar sus tres cálculos.
- Probar una calculadora, guardar el resultado y recargar el proyecto.
- Abrir el informe y usar la impresión del navegador.

## Actualizaciones

Los despliegues automáticos están deshabilitados para que un cambio accidental no interrumpa la entrega. Después de subir un cambio comprobado a la rama configurada, utiliza **Manual Deploy → Deploy latest commit** en Render o `render deploys create ID_DEL_SERVICIO --wait --confirm -o json` con la CLI autenticada.

Las migraciones no borran datos. Un rollback del código tampoco revierte cambios de la base; comprueba compatibilidad antes de volver a una versión anterior.

## Límites del plan gratuito

Según la [documentación de Render](https://render.com/docs/free), el servidor se suspende tras 15 minutos sin tráfico y puede tardar alrededor de un minuto en volver. Abre la aplicación unos minutos antes de exponer. PostgreSQL gratuito caduca a los 30 días; exporta los datos o cambia de plan antes de esa fecha si necesitas conservarlos. No se contrataron recursos de pago.

La recuperación por correo requiere configurar un servicio de correo. No se incluyó SMTP en este despliegue; el plan gratuito de Render bloquea los puertos SMTP habituales.

## Desarrollo local

```sh
npm run demo        # PostgreSQL y Redis locales mediante Docker
npm run demo:local  # Respaldo de presentación con SQLite
```

La base local y la de Render son independientes. El despliegue carga el catálogo y los ejemplos, no los registros privados de tu equipo.
