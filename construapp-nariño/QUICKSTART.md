# Inicio rápido

Actualizado: 10 de noviembre de 2026.

## Presentar en este equipo

Abre una terminal en la carpeta `construapp-nariño` y ejecuta:

```powershell
npm run demo
```

Abre http://localhost:3000. Accede con `demo@construapp.co` y `demo-12345678`. Encontrarás la obra “Remodelación de habitación en Pasto · Demo” con tres cálculos. El catálogo conserva las fechas reales de consulta.

El arranque comprueba que los puertos 3000 y 5000 estén libres, inicia PostgreSQL/Redis mediante Docker, prepara esquema y demo, verifica la conexión de la API y después inicia la web. Si falla, muestra el motivo y detiene los procesos iniciados por el comando.

## Respaldo sin Docker

```powershell
npm run demo:local
```

Usa un archivo SQLite independiente en `backend/data/entrega-demo.sqlite`. La cuenta y la obra de demo se preparan también aquí. Tus proyectos de PostgreSQL no aparecen en SQLite. No se modifica `.env`. Cierra el modo anterior con Ctrl+C antes de cambiar de modo.

## Instalación en otro equipo

1. Instala Node.js (esta entrega se verificó con Node.js 22.14.0 y npm 11.6.0) y npm.
2. En la raíz del monorepo ejecuta `npm install`.
3. Para PostgreSQL, instala Docker Desktop, copia `backend/.env.example` a `backend/.env` y configura los valores. Los puertos habituales son PostgreSQL 5433 y Redis 6380.
4. Ejecuta `npm run demo`. Sin Docker, ejecuta `npm run demo:local`.

Las cuentas demo son solo para desarrollo. No publiques un despliegue de producción con contraseñas de ejemplo.

## Comprobar disponibilidad

http://localhost:5000/api/status debe mostrar `database: connected`. Con PostgreSQL/Redis de la demo, la caché también debe figurar conectada. En el respaldo SQLite se desactiva la caché intencionalmente.

## Verificación

```powershell
npm run typecheck
npm test
npm run build --workspace=construapp-frontend
npm run build --workspace=construapp-backend
```

Consulta [ENTREGA-FINAL.md](docs/ENTREGA-FINAL.md) para el recorrido de presentación.
