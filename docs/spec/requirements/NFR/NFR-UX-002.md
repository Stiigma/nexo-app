# NFR-UX-002: Escritorio para administración

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | NFR-UX-002 |
| **Título** | Escritorio para administración |
| **Tipo** | NFR (Non-Functional Requirement) |
| **Prioridad** | P1 |
| **MoSCoW** | Should |
| **Estado** | Draft |
| **Fuente** | `NEXO_PROJECT.md` §9 — Web/escritorio |
| **Dueño** | Nexo project |

## Declaración

Las vistas de administración (reportes, catálogos, usuarios, correcciones) deben
priorizar la experiencia en escritorio con layouts de mayor densidad de
información.

## Racional

Los admins trabajan desde computadora para revisar reportes, gestionar catálogos
y revisar datos operativos.

## Criterio de Aceptación

- Dado que accedo desde un viewport de escritorio (≥1024px),
  cuando navego a las secciones admin,
  entonces veo layouts optimizados con tablas, filtros y datos densos.

## Método de Verificación

- [ ] Revisión visual: vistas admin en escritorio.

## Artefactos de implementación

### Frontend
- Feature: `front/src/features/catalogs/`
  - `components/CatalogDataTable.tsx` — tabla densa
  - `components/CatalogToolbar.tsx` — toolbar con acciones
- Feature: `front/src/features/admin/`
  - `views/UsersPage.tsx` — gestión de usuarios

## Notas

- P1: el MVP puede priorizar mobile; escritorio se optimiza después.
