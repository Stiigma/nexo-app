# FR-CAT-001: Gestionar tiendas

## Metadata

| Atributo | Valor |
|---|---|
| **ID** | FR-CAT-001 |
| **Título** | Gestionar tiendas (Stores) |
| **Tipo** | FR (Functional Requirement) |
| **Módulo** | Catalogs |
| **Prioridad** | P1 |
| **MoSCoW** | Should |
| **Estado** | Implemented |
| **Fuente** | `NEXO_PROJECT.md` §7 — Catalogos |
| **Dueño** | Nexo project |
| **Dependencias** | FR-AUTH-002 (Admin role), FR-CAT-004 (store tax rate) |
| **Stories vinculadas** | US-013 |

## Declaración

El sistema debe permitir a administradores gestionar el catálogo de tiendas
(Stores) con nombre, active flag, dirección, ciudad, estado y tasa de tax
predeterminada. La desactivación no debe romper datos históricos.

## Racional

Las tiendas son el origen de las compras. Tener un catálogo formal con
dirección completa permite análisis geográfico y consistencia operativa.

## Criterio de Aceptación

- Dado que soy admin,
  cuando creo una tienda,
  entonces puedo ingresar nombre, dirección, ciudad, estado y tax rate.

- Dado que una tienda está desactivada,
  cuando un operador inicia un carrito,
  entonces la tienda no aparece en el selector.

- Dado que una tienda está desactivada,
  cuando consulto lotes históricos de esa tienda,
  entonces los datos históricos se preservan.

## Método de Verificación

- [ ] Demo: CRUD completo de tiendas.
- [ ] Prueba de integración: desactivación no afecta datos históricos.

## Artefactos de implementación

### Backend
- Módulo NestJS: `back/src/modules/catalogs/`
  - `interface/http/controllers/stores.controller.ts` — endpoints REST
  - `interface/http/dto/create-store.dto.ts` — DTO creación
  - `interface/http/dto/update-store.dto.ts` — DTO actualización
  - `domain/simple-catalog-entity.ts` — entidad base
  - `application/simple-catalog.service.ts` — lógica CRUD
  - `application/ports/catalog-repository.ts` — puerto
  - `infrastructure/repositories/prisma-catalog.repository.ts` — impl. Prisma

### Frontend
- Feature: `front/src/features/catalogs/`
  - `views/CatalogsPage.tsx` — página de catálogos
  - `components/CatalogEntityView.tsx` — vista por entidad
  - `components/CatalogFormDialog.tsx` — formulario CRUD
  - `types/entities/store.ts` — tipo Store
  - `services/catalog-service.ts` — llamadas API
  - `config/registry.ts` — registro de entidad store

### Prisma
- Modelo `Store` en `back/prisma/schema.prisma`

## Notas

- Implementado (backend y frontend).
- US-013 asociada.
