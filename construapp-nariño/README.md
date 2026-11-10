# ConstruApp Nariño

Aplicación web para estimar materiales de construcción, consultar precios publicados y organizar presupuestos por obra. Entrega académica: **10 de noviembre de 2026**.

## Aplicación publicada

**[Abrir ConstruApp Nariño](https://construapp-narino.onrender.com)**. La web, la API y PostgreSQL funcionan en Render; no necesitas encender el servidor local.

Cuenta pública para la presentación: `demo@construapp.co` · contraseña `demo-12345678`. Contiene una obra de ejemplo y no tiene permisos de administrador. Crea una cuenta propia para tus proyectos personales.

El plan gratuito puede tardar alrededor de un minuto al abrir después de estar inactivo. La base gratuita vence el **10 de diciembre de 2026**. Configuración y mantenimiento: [guía de despliegue](docs/DEPLOYMENT.md).

## Arranque para la entrega

Desde esta carpeta, con Node.js y las dependencias instaladas:

```powershell
npm run demo
```

El comando inicia Docker Desktop cuando hace falta, levanta PostgreSQL y Redis, aplica las migraciones, prepara el catálogo y la obra de ejemplo, comprueba la conexión y arranca API y web. Abre **http://localhost:3000**. Mantén la terminal abierta; Ctrl+C cierra API y web. Los contenedores conservan los datos.

**Cuenta local de demostración:** `demo@construapp.co` · contraseña `demo-12345678`. Sin permisos de administración. En el hosting solo se habilita explícitamente para la presentación mediante `DEMO_MODE=true`; no almacenes información privada en esta cuenta compartida.

**Obra preparada:** “Remodelación de habitación en Pasto · Demo”, con pintura, piso y muro. Volver a ejecutar el comando conserva los cambios de la obra existente.

Si Docker no está disponible:

```powershell
npm run demo:local
```

Este modo utiliza SQLite en `backend/data/entrega-demo.sqlite`, independiente de PostgreSQL. Conserva los datos entre arranques y utiliza las mismas calculadoras y catálogo. No cambia `backend/.env`. No es sincronización offline del navegador. Ejecuta un solo modo a la vez.

Consulta el [guion de entrega](docs/ENTREGA-FINAL.md) y el [inicio rápido](QUICKSTART.md).

## Funciones disponibles

- Nueve calculadoras: hormigón, cimiento ciclópeo, acero, mampostería, bloque, mortero, piso/enchape, pintura y cubierta.
- Medidas, unidades, variantes de materiales, desperdicio, desglose de cantidades y costo en COP.
- Explicación desplegable de fórmula, rendimientos y redondeos, generada con las constantes del motor.
- Borradores por calculadora en la pestaña durante un máximo de 12 horas desde su último guardado. Se recuperan al navegar, recargar o iniciar sesión; “Limpiar medidas” reinicia el cálculo.
- Registro, inicio de sesión, recuperación de contraseña y permisos de usuario/administrador.
- Proyectos, presupuesto objetivo, cálculos guardados, estados y lista de compra consolidada.
- Creación de proyecto y primer cálculo en una operación transaccional. Los importes siempre se recalculan en el servidor.
- Informe del proyecto en A4 mediante **Imprimir / Guardar PDF**, con cantidades, costos, fuentes y condiciones.
- Catálogo con 33 materiales y 34 precios publicados de siete comercios; búsqueda y filtros de proveedores.
- Administración de materiales, proveedores, precios y estado de usuarios.
- Interfaz web adaptable a móviles, tema claro/oscuro, etiquetas de formulario y estados de error.

## Alcance y límites

Los precios del lote inicial fueron consultados el **5 de noviembre de 2026**; no se actualizan automáticamente ni garantizan existencias o entrega en Nariño. Cada fuente conserva su fecha y condiciones. Los cálculos guardados mantienen su precio histórico. Véase [PRECIOS-REALES.md](docs/PRECIOS-REALES.md).

Las cantidades son estimaciones académicas basadas en rendimientos de referencia; no sustituyen un diseño estructural. Los totales no incluyen mano de obra y pueden requerir transporte, impuestos pendientes, pedidos mínimos o redondeo a empaques.

La aplicación React Native/Expo contiene una portada de prototipo. Las calculadoras y la gestión de obras funcionan en la **web adaptable a celular**. Excel, instalaciones eléctricas/hidráulicas, sincronización offline, pagos y actualización automática de precios quedan como trabajo futuro.

La recuperación por correo requiere SMTP configurado. La generación PDF usa la impresión del navegador; no es un servicio externo de exportación.

## Estructura y tecnologías

- `backend/`: Node.js, Express, TypeScript, Sequelize, PostgreSQL, JWT y Redis opcional.
- `frontend/`: React, Vite, TypeScript, Tailwind CSS y TanStack Query.
- `mobile/`: prototipo React Native/Expo.
- `scripts/start.mjs`: arranque coordinado y comprobación de disponibilidad.
- `docs/`: documentación, alcance y guion.

## Comandos

| Comando | Función |
| --- | --- |
| `npm install` | Instalar dependencias del monorepo |
| `npm run demo` | Preparar y abrir el entorno con PostgreSQL y Redis |
| `npm run demo:local` | Preparar y abrir el respaldo independiente con SQLite |
| `npm run demo:prepare` | Preparar PostgreSQL y datos de demo sin iniciar la web |
| `npm run dev` | Arrancar servicios y web con la configuración existente |
| `npm run dev:backend` | API por separado en 5000 |
| `npm run dev:frontend` | Web por separado en 3000 |
| `npm run dev:mobile` | Prototipo Expo |
| `npm run typecheck` | Comprobar TypeScript de los tres paquetes |
| `npm test` | Pruebas existentes; backend en secuencia para evitar saturación |
| `npm run build --workspace=construapp-frontend` | Compilar web de producción |
| `npm run build --workspace=construapp-backend` | Compilar API |

Para una instalación nueva, copia `backend/.env.example` a `backend/.env` y ajusta la configuración antes del modo PostgreSQL. El respaldo SQLite puede usarse sin ese archivo. Los secretos y las bases locales no se versionan.

## Documentación

- [Entrega y demostración](docs/ENTREGA-FINAL.md)
- [Estado actual](docs/ESTADO.md)
- [API](docs/API.md)
- [Arquitectura](docs/ARCHITECTURE.md)
- [Precios y condiciones](docs/PRECIOS-REALES.md)
- [Trabajo futuro](docs/ROADMAP.md)

Licencia MIT. Proyecto académico ConstruApp Nariño.
