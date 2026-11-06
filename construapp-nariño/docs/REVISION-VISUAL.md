# Revisión de Construapp Nariño

La portada existente es la referencia: se mantienen Barlow y Barlow Condensed, el naranja ladrillo, el papel cálido y los croquis técnicos SVG. El desarrollo continúa en React, Vite, TypeScript y Tailwind.

## Cambios aplicados

- Portada con jerarquía tipográfica, navegación móvil, resumen del catálogo conectado a la API, herramientas agrupadas por etapa y acceso claro al cálculo y al registro.
- Componentes compartidos para mantener la misma organización de calculadoras en portada e inicio.
- Selector de calculadoras más compacto y croquis con sus unidades.
- Resultados y listas de compra con fichas en móvil; las tablas permanecen en escritorio e impresión. Cantidades, precios unitarios, subtotales y fuentes se pueden leer sin desplazamiento horizontal.
- Aviso cuando cambian las medidas de un resultado y bloqueo del guardado hasta recalcular.
- Tarjetas de proveedores adaptadas a pantallas pequeñas; los comercios sin calificaciones no muestran estrellas.
- Menús con desplazamiento interno en pantallas horizontales de poca altura.
- Fuentes y condiciones disponibles también en la lista de compra del proyecto.

## Revisión integral del frontend

- Navegación lateral más compacta, iconos de sección con estado activo y cabecera móvil de 64 px. Se mantiene la barra inferior y el acceso al menú de usuario.
- Formularios de acceso, registro y recuperación con tarjeta central, enlaces de regreso y panel técnico de marca en escritorio.
- Campos de 48 px, ayudas y errores asociados al control, foco visible y selectores de apariencia con objetivos táctiles de 40 px. Búsqueda reutilizable con acción para limpiar.
- Proyectos con resumen de cifras reales, búsqueda por nombre o ubicación sin distinguir tildes, orden por actualización o nombre y filtros de estado combinables. El resumen ocupa una sola fila en móvil.
- Tarjetas de proyecto con jerarquía de título, ubicación, estado, presupuesto y actualización. Las fichas de obra destacan el costo, presupuesto objetivo y disponible.
- Fichas de proveedor con contacto claro y precios en tarjetas móviles; las tablas se mantienen desde tablet. Los proveedores sin valoraciones muestran ese estado sin estrellas.
- Administración con cuatro accesos visibles también en móvil, búsqueda y estado para materiales, búsqueda por nombre, ubicación o contacto para proveedores y filtros de usuarios agrupados.
- Registro de precios dividido en material y valor, fuente y condiciones, con guardado al final del formulario. En móvil, cada precio conserva la presentación, proveedor, fuente y fecha en su propia ficha.
- Diálogos, mensajes de error, estados vacíos y página 404 coherentes con la identidad existente. Las acciones y columnas de tablas se adaptan a 320 px.

Estos cambios son de presentación e interacción del frontend. Los servicios, permisos, fórmulas y registros existentes conservan su comportamiento.

## Comprobaciones

Se revisaron los tamaños de 320, 390, 768, 1024 y 1440 px, los temas claro y oscuro, la navegación móvil y el ancla de la portada. La revisión funcional adicional comprobó las nueve calculadoras, el acceso desde su formulario, el bloqueo de resultados anteriores, la lista de compra, la impresión, el foco y cierre con Escape de los diálogos y el menú en horizontal. No se generaron proyectos ni compras para estas comprobaciones.

Las capturas de revisión y el informe de las comprobaciones adicionales están en `backend/logs/visual-review/`, una carpeta local ignorada por Git. Los precios publicados conservan las condiciones y límites descritos en [PRECIOS-REALES.md](./PRECIOS-REALES.md).

La auditoría integral recorre las pantallas públicas, acceso, recuperación, calculadoras, catálogo, fichas, proyectos y las cuatro secciones administrativas a 320, 390, 768, 1024 y 1440 px. Revisa también etiquetas de campos, tablas móviles, búsquedas sin resultados, limpieza de filtros, foco y cierre de diálogos, validación de precios y selección de tema. Su informe local está en `backend/logs/visual-review/frontend-report.json`.

Resultado de la revisión integral: 314 comprobaciones de interfaz aprobadas y 39 comprobaciones funcionales aprobadas. La compilación de producción del frontend y las 6 pruebas de Vitest terminaron correctamente.
