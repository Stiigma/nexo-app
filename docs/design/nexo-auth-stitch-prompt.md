# Prompt Para Google Stitch - Auth Nexo

> Tipo: prompt de diseño externo para Google Stitch.
> Tarea: `NEXO-0021`.
> Fuente de producto: Nexo v1 ya implementa roles backend `Admin` y `Operator`.
> Nota: `Cliente` se trata como portal preparado/futuro, no como rol backend
> disponible hoy.

## Prompt Listo Para Pegar En Stitch

Diseña una pantalla de autenticación responsive para **Nexo**, una PWA
mobile-first de control de compras, ventas, inventario, apartados, clientes y
reportes para una startup de reventa de ropa en Ensenada.

Usa una dirección visual **operativa premium**: limpia, rápida, confiable y
profesional. No hagas landing page ni marketing hero. La primera pantalla debe
ser útil para iniciar sesión.

## Marca

- Usa el logo horizontal de Nexo completo: fondo negro, wordmark blanco itálico
  y slash azul eléctrico.
- No recortes ni deformes el logo.
- Coloca el logo sobre una placa oscura sólida.
- Color principal: azul eléctrico `#138BFF`, sólo para CTA principal, foco,
  selección y estado activo.
- Usa canvas claro `#F7F8FA`, superficies blancas, bordes suaves `#E1E5EC` y
  texto principal `#14171F`.
- Tipografía: Inter.
- Evita glassmorphism, gradientes morados/azules, fondos abstractos, orbs,
  dashboards genéricos oscuros y exceso de azul.

## Layout

- Desktop: pantalla dividida funcional.
  - Izquierda: panel oscuro de marca con logo Nexo, frase corta "Control
    operativo de inventario, ventas y apartados", y un mosaico editorial de
    productos reales.
  - Derecha: formulario de acceso en canvas claro.
- Mobile: una sola columna.
  - Header oscuro compacto con logo.
  - Formulario primero.
  - Franja horizontal de productos debajo.
- Radios discretos de 8px o menos.
- Nada de tarjetas anidadas.

## Usuarios Y Permisos

- Incluye selector visual de audiencia con tres opciones:
  - `Operador`
  - `Administrador`
  - `Cliente`
- Aclara visualmente que el rol real lo determina la cuenta, no el selector.
- `Operador`: captura compras, prendas, apartados, ventas e inventario
  operativo.
- `Administrador`: catálogos, usuarios, reportes, correcciones y todo el
  inventario.
- `Cliente`: portal preparado/futuro para consultar apartados, historial y
  datos de contacto. Etiquetar como "Próximamente" o "Acceso clientes" sin
  prometer funciones completas.
- No muestres `Cliente` como rol backend disponible. Debe sentirse planeado,
  informativo y no bloqueante.

## Formulario

- Título: "Entrar a Nexo".
- Campos:
  - "Correo"
  - "Contraseña"
- Botón primario: "Entrar".
- Acción secundaria: "¿Necesitas acceso? Contacta al administrador".
- Link: "Olvidé mi contraseña".
- Checkbox o toggle: "Mantener sesión en este dispositivo".
- Mostrar/ocultar contraseña con icono.
- Todos los campos deben tener label visible, foco claro, error inline y estado
  disabled/loading.

## Estados Visibles

- Default.
- Focus en campo.
- Loading en botón: "Entrando...".
- Error: "Correo o contraseña incorrectos".
- Sin permiso: pantalla o alerta "Tu cuenta no tiene permiso para esta
  sección".
- Cliente próximamente: estado informativo no bloqueante.
- Éxito: transición hacia workspace según rol.

## Sección De Marcas Y Productos

- Usa una sección llamada "Inventario que pasa por Nexo".
- Mostrar mosaico de fotos/productos, no logos oficiales inventados.
- Incluir referencias visuales de las marcas y categorías presentes:
  - Adidas
  - Gymshark
  - Lululemon
  - Mitchell & Ness
  - The North Face
  - Owala
  - jerseys deportivos
  - sneakers
  - hoodies
  - leggings
  - pants
  - chamarras
  - botellas
- La sección debe sentirse como inventario real de reventa, no como ecommerce
  de lujo ni stock photography.

## Copy

- Todo en español.
- Usar "Administrador", "Operador", "Cliente", "Inventario", "Apartados",
  "Ventas" y "Reportes".
- No mezclar etiquetas en inglés como "Dashboard", "Purchase Cart" o
  "Customer".

## Accesibilidad

- Contraste AA.
- Targets táctiles mínimos de 44px.
- Orden de tab lógico.
- Focus visible azul.
- Estados no dependientes sólo del color.
- Diseño usable en móvil y escritorio.

## Entrega Esperada

- Genera una propuesta visual pulida para desktop y mobile.
- Debe sentirse como una app de operaciones seria, no como landing page.
- Prioriza claridad, confianza, velocidad y separación por permisos.

## Assets A Usar

- Logo: `docs/brand/nexo-logo.png`.
- Fotos reales:
  `harness/fixtures/inventory/manual-stock-2026-07-06/items/*/photos/main.jpeg`.
- Si Stitch no puede importar rutas locales, deja placeholders claros con estas
  etiquetas:
  - `FOTO - Adidas pants negro`
  - `FOTO - Adidas pants verde`
  - `FOTO - Adidas sneakers azul`
  - `FOTO - Adidas sneakers rosa`
  - `FOTO - Gymshark sudadera verde`
  - `FOTO - Lululemon chamarra negra`
  - `FOTO - Lululemon leggings azul`
  - `FOTO - Lululemon leggings verde`
  - `FOTO - Mitchell & Ness Padres jersey`
  - `FOTO - Bucks jersey verde`
  - `FOTO - Mitchell & Ness Kobe jersey`
  - `FOTO - The North Face sudadera verde`
  - `FOTO - The North Face chamarra negra`
  - `FOTO - The North Face sudadera negra`
  - `FOTO - The North Face suéter blanco`
  - `FOTO - Owala botella rosa`
  - `FOTO - Owala botella verde`

## Referencias Visuales Reales

- Adidas: pants negro, pants verde, sneakers azul, sneakers rosa.
- Gymshark: sudadera verde.
- Lululemon: chamarra negra, leggings azul, leggings verde.
- Mitchell & Ness: Padres jersey, Kobe jersey.
- Jerseys deportivos: Bucks jersey verde.
- The North Face: sudadera verde, chamarra negra, sudadera negra, suéter
  blanco.
- Owala: botellas rosa y verde.

## Criterios De Aceptación

- La pantalla permite entender claramente el acceso para Operador,
  Administrador y Cliente.
- El diseño mantiene Cliente como acceso futuro/preparado, sin contradecir la
  auth actual.
- El logo Nexo tiene presencia real.
- El mosaico de productos comunica las marcas y categorías del inventario.
- La UI es mobile-first, en español, accesible y no genérica.

## Supuestos

- Cliente se incluye por intención de producto, pero no como rol backend ya
  implementado.
- Stitch puede recibir o referenciar assets; si no, debe dejar placeholders
  claros para logo y fotos.
