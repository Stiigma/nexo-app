# NFR-SEC-001: HTTPS en producción

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | NFR-SEC-001 |
| **Título** | HTTPS en producción |
| **Tipo** | NFR (Non-Functional Requirement) |
| **Prioridad** | P0 |
| **MoSCoW** | Must |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §11 — Supuestos base |
| **Dueño** | Nexo project |
| **Dependencias** | CON-007 (internet + HTTPS) |

## Declaración

Todo el tráfico de producción debe usar HTTPS. El entorno de producción debe
rechazar peticiones HTTP simples.

## Racional

Los datos financieros y de clientes deben viajar cifrados. HTTPS es un requisito
de PWA y de seguridad básica.

## Criterio de Aceptación

- Dado que un cliente intenta acceder vía HTTP,
  cuando la petición llega al servidor,
  entonces es redirigida a HTTPS o rechazada.

## Método de Verificación

- [ ] Inspección: despliegue valida redirección HTTP→HTTPS.

## Artefactos de implementación

### Backend
- `back/src/main.ts` — configuración de HTTPS (NestJS)
- Infraestructura: proxy reverso (nginx, CloudFront, etc.)

### Frontend
- PWA service worker requiere HTTPS

## Notas

- Responsabilidad compartida con infraestructura/deploy.
