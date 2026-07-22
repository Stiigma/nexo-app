# Nexo - Sistema de Control de Compras, Ventas e Inventario

Este documento es el punto de inicio del proyecto Nexo. Su objetivo es
concentrar el entendimiento del negocio, el alcance de la primera version y
las decisiones base antes de separar el trabajo en proyectos especificos como
`back`, `front`, `harness`, `infra` y documentacion tecnica.

## 1. Contexto del negocio

Nexo es una startup de ropa que inicia operaciones en Ensenada, Baja
California. El negocio compra ropa en tiendas de Estados Unidos y despues la
revende en Mexico con un margen sobre el costo original.

El sistema debe ayudar a controlar:

- Que prendas entran al inventario.
- Donde y cuando se compro cada prenda.
- Cuanto costo cada prenda, incluyendo tax, tipo de cambio y gastos asociados.
- Que prendas estan disponibles, apartadas o vendidas.
- Cuando y por cuanto se vendio cada prenda.
- Cuanto se ha gastado, cuanto se ha vendido y cual es la utilidad.

La primera version sera un sistema de control interno. No reemplaza un sistema
contable ni fiscal formal, pero debe generar informacion clara para operar el
negocio y apoyar revisiones futuras con un contador.

## 2. Objetivo de v1

Construir una PWA mobile-first con experiencia tipo app para registrar compras,
prendas, gastos, apartados, ventas e inventario. Las vistas moviles se enfocan
en captura rapida durante compras y ventas. Las vistas web/escritorio se
enfocan en reportes, administracion y revision operativa.

El sistema debe permitir que Nexo sepa, como minimo:

- Cuanto inventario tiene disponible.
- Que prendas ya fueron vendidas.
- Que prendas estan apartadas.
- Cuanto costo comprar un lote.
- Cuanto se ha gastado por periodo.
- Cuanto se ha vendido por periodo.
- Cual es la utilidad estimada por prenda, venta y periodo.

## 3. Plataforma y arquitectura objetivo

### Stack base

- Frontend: `React`.
- Backend: `NestJS`.
- Base de datos: `PostgreSQL`.
- Tipo de producto: PWA mobile-first.
- Fotos: almacenamiento S3-compatible.
- Moneda de reporte: MXN.
- Compras y ventas: guardar moneda original y equivalente en MXN.

### Modulos futuros del repositorio

La raiz del proyecto puede evolucionar hacia una estructura similar a:

```text
/
  NEXO_PROJECT.md
  back/
  front/
  harness/
  infra/
  docs/
```

Uso esperado de cada modulo:

- `back`: API NestJS, reglas de negocio, persistencia, autenticacion,
  integraciones y jobs.
- `front`: PWA React, vistas moviles, vistas web y componentes de UI.
- `harness`: pruebas end-to-end, fixtures, datos de prueba y utilidades para
  validar flujos completos.
- `infra`: despliegue, configuracion de ambientes, storage, base de datos y
  secretos.
- `docs`: ADRs, diagramas, manuales operativos y documentacion especifica.

## 4. Modelo de dominio

### Lote de compra

Una visita de compra a una tienda en una fecha determinada. Un lote contiene
una o varias prendas, usa una tienda, puede tener tax, tipo de cambio y gastos
asociados.

Estados:

- `abierto`: se pueden agregar o modificar prendas.
- `cerrado`: se calculan totales y las prendas quedan disponibles para venta.

### Prenda

Una pieza individual vendible y trazable. La prenda es la unidad principal del
inventario.

Campos esenciales:

- Codigo interno.
- QR imprimible.
- Foto principal obligatoria.
- Fotos opcionales.
- Categoria.
- Marca.
- Talla.
- Costo de compra.
- Tax calculado.
- Gastos asignados.
- Costo total.
- Precio sugerido.
- Estado.
- Notas opcionales.

Estados:

- `disponible`: puede venderse o apartarse.
- `apartada`: esta reservada para un cliente.
- `vendida`: ya fue incluida en una venta.

### Venta

Registro de una o varias prendas vendidas. La venta guarda fecha, cliente,
moneda, metodo de pago y precio final real.

Las ventas pueden capturarse en MXN o USD. Para reportes, toda venta debe tener
equivalente en MXN.

### Gasto

Salida de dinero relacionada con la operacion. Un gasto puede ser:

- General: afecta los reportes del negocio, pero no se asigna a prendas.
- Ligado a lote: forma parte del costo real del lote y se reparte entre sus
  prendas.

Los gastos ligados a un lote se reparten proporcionalmente al costo base de
cada prenda.

### Cliente

Persona que compra o aparta prendas. En v1 se manejara como catalogo simple
para poder consultar historial.

Campos base:

- Nombre requerido.
- Telefono opcional.
- Instagram opcional.
- WhatsApp opcional.
- Notas opcionales.

### Apartado

Reserva simple de una prenda para un cliente. No maneja anticipos ni cuentas por
cobrar en v1.

Campos base:

- Prenda.
- Cliente.
- Fecha.
- Nota opcional.

### Costo total

Costo real estimado de una prenda expresado en MXN. Incluye:

- Costo de compra convertido a MXN.
- Tax correspondiente.
- Parte proporcional de gastos ligados al lote.

### Utilidad

Diferencia entre el precio final de venta en MXN y el costo total de la prenda
en MXN.

Formula base:

```text
utilidad = precio_final_venta_mxn - costo_total_prenda_mxn
```

## 5. Moneda, tax y tipo de cambio

### Politica de moneda

Cada importe relevante debe guardar:

- Moneda original.
- Monto original.
- Tipo de cambio aplicado cuando corresponda.
- Equivalente en MXN.

Esto permite operar con compras en USD, ventas en MXN o USD y reportes
consolidados en MXN.

### Compras en Estados Unidos

Los lotes de compra en Estados Unidos normalmente se capturan en USD. El sistema
debe calcular el equivalente en MXN usando tipo de cambio automatico diario.

### Ventas en Mexico o USD

Las ventas pueden registrarse en MXN o USD. Si una venta se registra en USD, el
sistema debe calcular y guardar su equivalente en MXN.

### Tipo de cambio

La decision base es usar tipo de cambio automatico diario. Como proveedor
recomendado para USD a MXN se considera Banxico SIE/FIX, guardando siempre la
tasa aplicada para que los calculos sean auditables aunque la tasa externa
cambie despues.

### Tax

Cada tienda tendra una tasa de tax predeterminada. Al capturar una prenda o
lote, el sistema calcula el tax automaticamente, pero debe permitir correccion
manual cuando el ticket real no coincida.

## 6. Flujos principales

### Flujo: iniciar lote de compra

1. El usuario abre la app movil.
2. Selecciona `Iniciar lote de compra`.
3. Selecciona tienda.
4. El sistema carga el tax predeterminado de la tienda.
5. El sistema obtiene el tipo de cambio diario.
6. El lote queda en estado `abierto`.

### Flujo: agregar prenda al lote

1. El usuario toma o sube una foto principal.
2. Selecciona categoria, marca y talla.
3. Captura costo de compra.
4. El sistema calcula tax y equivalente en MXN.
5. El usuario captura precio sugerido.
6. El sistema asigna codigo interno y QR.
7. La prenda queda dentro del lote abierto.

### Flujo: cerrar lote de compra

1. El usuario revisa las prendas del lote.
2. Agrega gastos ligados al lote si existen.
3. El sistema reparte gastos proporcionalmente al costo de las prendas.
4. El sistema calcula costo total por prenda.
5. El lote cambia a `cerrado`.
6. Las prendas quedan como `disponible`.

### Flujo: apartar prenda

1. El usuario selecciona una prenda disponible.
2. Selecciona o crea cliente.
3. Captura nota opcional.
4. La prenda cambia a `apartada`.

### Flujo: vender prenda

1. El usuario crea una venta.
2. Selecciona una o varias prendas disponibles o apartadas.
3. Selecciona cliente.
4. Captura precio final real.
5. Selecciona moneda y metodo de pago.
6. Si la moneda es USD, el sistema calcula equivalente en MXN.
7. El sistema calcula utilidad.
8. Las prendas cambian a `vendida`.

### Flujo: imprimir QR

1. El usuario selecciona prendas.
2. El sistema genera una hoja imprimible desde navegador.
3. Cada etiqueta muestra codigo interno y QR.
4. El QR permite abrir o localizar la prenda dentro del sistema.

## 7. Funcionalidades v1

### Compras

- Crear lote de compra.
- Seleccionar tienda.
- Usar tax predeterminado editable.
- Obtener tipo de cambio automatico diario.
- Agregar prendas con foto y datos esenciales.
- Cerrar lote.
- Consultar historial de compras.

### Inventario

- Ver prendas disponibles, apartadas y vendidas.
- Buscar por codigo, categoria, marca, talla o cliente.
- Consultar trazabilidad de compra y venta.
- Ver costo total, precio sugerido y utilidad cuando aplique.

### Ventas

- Registrar venta simple.
- Vender una o varias prendas.
- Asociar cliente.
- Capturar moneda MXN o USD.
- Capturar metodo de pago.
- Guardar precio final real.
- Calcular utilidad.

### Apartados

- Apartar prenda para cliente.
- Guardar fecha y nota.
- Liberar apartado si no se concreta.
- Convertir apartado en venta.

### Gastos

- Registrar gastos generales.
- Registrar gastos ligados a lote.
- Categorizar gastos.
- Incluir gastos ligados en costo total de prendas.

### Clientes

- Crear clientes.
- Editar datos basicos.
- Consultar historial de compras y apartados.

### Catalogos

Catologos editables por administradores:

- Tiendas.
- Categorias.
- Marcas.
- Tallas.
- Metodos de pago.
- Tipos de gasto.

### Reportes

Reportes base de v1:

- Compras por periodo.
- Ventas por periodo.
- Gastos por periodo.
- Inventario disponible.
- Inventario apartado.
- Inventario vendido.
- Costo vendido.
- Utilidad por periodo.
- Margen por periodo.

## 8. Roles y permisos

### Admin

Puede:

- Gestionar catalogos.
- Ver reportes.
- Gestionar usuarios.
- Corregir datos operativos.
- Consultar todo el inventario.

### Operador

Puede:

- Crear lotes de compra.
- Capturar prendas.
- Registrar apartados.
- Registrar ventas.
- Consultar inventario operativo.

## 9. UX y diseno

Direccion visual: operativa premium.

La interfaz debe sentirse limpia, rapida y confiable. La prioridad es facilitar
captura y consulta, no construir una landing page ni una experiencia puramente
editorial.

### Mobile-first

Priorizar en movil:

- Iniciar lote.
- Capturar prendas.
- Tomar fotos.
- Apartar prendas.
- Registrar ventas rapidas.
- Buscar prenda por codigo o QR.

### Web/escritorio

Priorizar en escritorio:

- Reportes.
- Administracion de catalogos.
- Revision de compras.
- Revision de gastos.
- Hoja imprimible de QR.
- Gestion de usuarios.

## 10. Alcance fuera de v1

No se incluye en v1:

- Facturacion fiscal.
- Calculo formal de impuestos mexicanos.
- Contabilidad completa.
- Modo offline.
- Anticipos en apartados.
- Cuentas por cobrar.
- Integracion directa con impresora de etiquetas.
- Importacion de datos historicos.
- CRM avanzado.
- App nativa iOS/Android.

## 11. Supuestos base

- El sistema arranca limpio, sin migracion inicial.
- La primera version requiere internet para operar.
- La app debe funcionar por HTTPS en produccion.
- Las fotos se guardan fuera de PostgreSQL.
- PostgreSQL guarda metadatos, URLs y relaciones.
- La moneda de reporte es MXN.
- El tipo de cambio usado en cada operacion queda guardado.
- El tax por tienda es editable.
- Los costos ligados a lote se reparten proporcionalmente.

## 12. Criterios de aceptacion v1

El MVP se considera funcional cuando se pueda:

- Crear un lote de compra en USD.
- Agregar prendas con foto principal obligatoria.
- Calcular tax y equivalente MXN.
- Cerrar un lote y dejar prendas disponibles.
- Registrar gastos generales y gastos ligados al lote.
- Calcular costo total por prenda.
- Apartar una prenda para un cliente.
- Registrar venta en MXN.
- Registrar venta en USD con equivalente MXN.
- Cambiar prendas vendidas a estado `vendida`.
- Consultar utilidad por prenda vendida.
- Ver reportes de compras, ventas, gastos e inventario.
- Generar una hoja imprimible con codigos QR.
- Separar permisos entre admin y operador.

## 13. Decisiones registradas

### PWA mobile-first

Se elige una PWA mobile-first porque Nexo necesita capturar informacion durante
compras en tienda usando celular, pero tambien necesita vistas web para reportes
y administracion.

### NestJS, React y PostgreSQL

Se elige `NestJS + React + PostgreSQL` como stack base para separar claramente
API, UI y datos relacionales. El dominio requiere relaciones y reportes sobre
compras, prendas, ventas, clientes, gastos y lotes.

### Storage S3-compatible para fotos

Las fotos de prendas se guardaran en storage S3-compatible. PostgreSQL solo
guardara metadatos y referencias, evitando que la base de datos cargue con
archivos pesados.

### Moneda original mas MXN

El sistema guardara cada importe en su moneda original y tambien su equivalente
en MXN. Esto conserva trazabilidad de compras/ventas en USD y permite reportes
consolidados en MXN.

### Utilidad con costo total

La utilidad se calculara restando el costo total de la prenda al precio final de
venta. El costo total incluye compra, tax y gastos ligados al lote.

## 14. Proximos pasos sugeridos

1. Crear documentacion de dominio en `CONTEXT.md`.
2. Crear ADRs minimos en `docs/adr/`.
3. Definir esquema inicial de base de datos.
4. Crear proyecto `back` con NestJS.
5. Crear proyecto `front` con React PWA.
6. Crear `harness` para pruebas de flujos completos.
7. Definir ambiente local con PostgreSQL y storage S3-compatible.
