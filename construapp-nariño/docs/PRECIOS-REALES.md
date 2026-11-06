# Precios publicados del catálogo

Consulta inicial: **5 de noviembre de 2026**. El catálogo incluye 33 materiales y 34 precios publicados de siete comercios reales. Cada precio conserva enlace, producto/presentación, condiciones y fecha de consulta en `backend/src/seeds/publishedPrices.ts`.

Se consultaron Central de Materiales Pasto, Homecenter Colombia, Loencuentras, Ferretería Metrópolis Center, Distriarcillas, Vasanico y Ferretería Bervar. La ubicación visible es la del comercio; una oferta de Bogotá o Barranquilla no constituye una cotización en Nariño. No se crean calificaciones ni plazos de entrega sin evidencia.

## Aplicar en una base existente

Desde la raíz del monorepo, con PostgreSQL configurado en `backend/.env`:

```powershell
npm run migrate --workspace=construapp-backend
npm run seed:catalog --workspace=construapp-backend
```

La segunda orden carga únicamente el catálogo, sin crear cuentas de prueba. La carga retira exclusivamente los tres proveedores ficticios originales identificados por nombre y correo exactos, junto con sus precios. Conserva proveedores particulares, proyectos, usuarios y cotizaciones editadas posteriormente. Ejecutarla de nuevo no renueva la fecha de consulta ni sobrescribe las cotizaciones manuales. Los cálculos guardados conservan su desglose histórico; los nuevos cálculos usan el catálogo actualizado.

## Alcance y actualización

Los precios son valores publicados, no una sincronización en tiempo real ni una garantía de disponibilidad. Se muestran las publicaciones que indican falta de stock, los pedidos mínimos de agregados (6 m³, entrega en Bogotá), las cajas de pisos y la tabla para formaleta cuyo precio se publica antes de IVA. Los totales estiman el importe por unidad del catálogo; los impuestos pendientes, transporte, pedidos mínimos y redondeo a empaques se deben cotizar con la tienda.

En la revisión final se actualizó también el único cálculo guardado que todavía usaba proveedores ficticios. Se conservaron sus entradas y cantidades, y se verificó que el nuevo total coincide con la suma de materiales. Su registro anterior quedó respaldado en `backend/logs/legacy-calculations-before-real-prices-*.json`. Esta corrección puntual no modifica las cotizaciones históricas de proveedores reales ni convierte la carga del catálogo en una actualización automática de proyectos.

Para registrar una nueva cotización, usar Administración → Precios y guardar el importe junto con enlace, producto/presentación y condiciones. Al editar un importe, la evidencia anterior se reemplaza; si no se aporta fuente, se vacía su fecha de consulta. Para renovar el lote inicial, verificar cada publicación, actualizar `publishedPrices.ts` y su fecha, y volver a cargar el catálogo.

Fuentes principales: [Central de Materiales Pasto](https://centraldematerialespasto.com/), [Homecenter](https://www.homecenter.com.co/), [Loencuentras](https://www.loencuentras.com.co/), [Metrópolis Center](https://www.metropoliscenter.com.co/), [Distriarcillas](https://distriarcillas.com/), [Vasanico](https://vasanico.com.co/), [Bervar](https://www.ferreteriabervar.com/).
