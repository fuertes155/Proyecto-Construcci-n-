# Guion de entrega final

**10 de noviembre de 2026 · ConstruApp Nariño**

## Abrir la demostración

Desde la carpeta `construapp-nariño`:

```powershell
npm run demo
```

Abre http://localhost:3000. Cuenta de desarrollo: **demo@construapp.co**. Contraseña: **demo-12345678**.

El comando inicia los servicios, prepara los datos y comprueba la conexión antes de mostrar la web. La web y la API de este arranque solo escuchan en el equipo local. Cierra con Ctrl+C antes de iniciar otro modo.

Si Docker falla, usa `npm run demo:local`. El respaldo conserva una copia independiente en SQLite, con la misma obra de ejemplo. No necesita sincronizarse con PostgreSQL ni cambiar `.env`.

## Recorrido de cinco minutos

1. **Problema y solución (30 s).** “ConstruApp ayuda a estimar materiales y organizar el presupuesto de una obra; permite consultar precios publicados con su fuente y fecha”. Muestra la portada y las nueve herramientas.
2. **Cálculo en vivo (60 s).** En Pintura, ingresa 40 m², dos manos, vinilo tipo 1 y desperdicio 5 %. El cálculo de referencia es `40 × 2 × 1,05 / 25 = 3,36`, redondeado a **4 galones**. Con el precio del catálogo revisado, el resultado es **$263.600 COP**. Abre “¿Cómo se calculó?” y explica fórmula y redondeo.
3. **Continuidad (45 s).** Puedes calcular sin cuenta. Pulsa “Inicia sesión” dentro del resultado, entra con la cuenta demo y comprueba que regresan las mismas medidas y el resultado. Si cambias una medida, el guardado se bloquea hasta recalcular.
4. **Guardar (45 s).** Pulsa “Crear proyecto y guardar”, asigna un nombre y presupuesto y confirma. Se abre la obra con el primer cálculo. El servidor vuelve a calcular el importe y guarda proyecto y cálculo juntos.
5. **Obra completa (60 s).** Abre “Remodelación de habitación en Pasto · Demo”. Tiene pintura, piso y muro, presupuesto de **$3.000.000**, costo inicial **$1.719.300** y disponible **$1.280.700**. Muestra los tres cálculos y la lista de compra consolidada.
6. **Resultado entregable (60 s).** Pulsa “Ver informe”. Muestra nombre, fecha, medidas, cantidades, costos, proveedores y condiciones. “Imprimir / Guardar PDF” abre el diálogo del navegador: elige Guardar como PDF y A4. Para una impresión limpia, desactiva encabezados y pies del navegador si aparecen.

Los importes indicados corresponden al catálogo de la revisión. Si editas los precios, explica que los cálculos nuevos usan esos valores; los guardados conservan su histórico.

## Qué explicar si te preguntan

- **Arquitectura:** React/TypeScript en la web; Express/TypeScript en la API; Sequelize y PostgreSQL; Redis opcional. SQLite sirve como respaldo local de la demo y como base aislada para pruebas.
- **Validación:** frontend ayuda al usuario; backend vuelve a validar medidas y calcula el presupuesto. El servidor no confía en un total enviado por el navegador.
- **Permisos:** cada usuario ve sus proyectos; el administrador gestiona catálogo, precios y usuarios.
- **Persistencia:** obras y cálculos están en la base. El borrador temporal está en la pestaña y caduca después de 12 horas desde su último guardado. No es una app offline.
- **Precios:** publicaciones consultadas, con enlace y fecha. No hay actualización automática ni garantía de stock. El lote inicial se consultó el 5 de noviembre de 2026.
- **Límites:** cantidades aproximadas, sin mano de obra. Confirma transporte, impuestos pendientes, empaques y pedidos mínimos. No es un programa de diseño estructural.
- **Móvil:** la web se adapta a celular. Expo es una portada de prototipo; el desarrollo móvil completo queda como trabajo futuro.

## Comprobaciones de esta entrega

Entorno: Windows, Node.js 22.14.0 y npm 11.6.0.

- 120 pruebas del backend y 9 del frontend aprobadas.
- Compilaciones de web y API aprobadas; TypeScript de frontend y móvil aprobado, compilación TypeScript del backend aprobada.
- Las nueve calculadoras verificadas contra PostgreSQL: sin precios faltantes en los ejemplos y totales coincidentes con la suma de materiales.
- Flujo en navegador: invitado → cálculo → inicio de sesión → recuperación → creación de proyecto y cálculo → detalle y presupuesto.
- Informe revisado en escritorio, 390 y 320 píxeles; formulario de creación revisado a 320 píxeles.
- Arranque SQLite, acceso de la cuenta demo y recuperación de la obra de tres cálculos comprobados. Total equivalente al ejemplo PostgreSQL.
- Proyecto temporal de ensayo retirado; la obra preparada conserva sus tres cálculos.

Las capturas, datos de verificación y una copia local de PostgreSQL están en `backend/logs/entrega-final/` (carpeta ignorada por Git). El archivo `postgres-entrega-final.dump` es una copia para restauración mediante `pg_restore`; no debe publicarse, porque contiene los registros de la base local.

## Antes de exponer

- Abre la aplicación y comprueba que la obra de ejemplo aparece.
- Conserva la terminal del arranque abierta.
- Ten a mano esta guía y usa la cuenta demo para evitar alterar tus otras obras.
- Si quieres empezar la calculadora en blanco, pulsa “Limpiar medidas”.
- Para mostrar precios, utiliza el catálogo ya cargado; abrir las páginas de las tiendas sí depende de Internet.
