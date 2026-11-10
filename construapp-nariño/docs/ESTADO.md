# Estado de la entrega

Actualizado: **10 de noviembre de 2026**.

El alcance entregable es la aplicación web adaptable a móviles y su API. La app Expo es un prototipo de portada.

## Implementado

- Nueve calculadoras, opciones de material, unidades, desperdicio y costo por material.
- Explicación de fórmulas y redondeos producida por el servidor usando sus constantes.
- Borrador por calculadora en sessionStorage, validado al leer, conservado hasta 12 horas y recuperado al volver de autenticación.
- Registro, acceso, permisos, recuperación de contraseña y administración.
- CRUD de proyectos, estados, presupuesto, cálculos guardados y consolidación de materiales.
- Creación de proyecto con primer cálculo transaccional, sin aceptar totales calculados por el cliente.
- Informe A4 para imprimir/guardar PDF con fuentes y condiciones.
- Catálogo de precios publicados con fecha y enlaces; actualización manual.
- Arranque coordinado con Docker/PostgreSQL/Redis y modo de respaldo SQLite independiente.
- Obra de demostración para la cuenta de desarrollo.

## Pendiente fuera de esta entrega

Exportación Excel, aplicación móvil funcional, sincronización offline, perfil editable desde la web, instalaciones eléctricas/hidráulicas, precios en tiempo real, pagos y despliegue público de producción.

El correo de recuperación requiere un SMTP configurado. Los precios no incluyen automáticamente transporte, pedidos mínimos o empaques; la guía de fuentes expone las condiciones.

## Verificación reproducible

Ejecutar `npm run typecheck`, `npm test` y las compilaciones de frontend/backend. Las pruebas del backend utilizan SQLite aislado en memoria y se ejecutan secuencialmente. El recorrido de demostración se debe verificar además en la aplicación conectada a PostgreSQL.

Los resultados finales de esta revisión se registran en [ENTREGA-FINAL.md](ENTREGA-FINAL.md). Los anteriores documentos de progreso e historias son antecedentes del desarrollo; este documento y el README describen el alcance actual.
