# CEF Code Map

Backend source root:
`/home/otomi/isyte-backup/Isyte/repos/CEF/SIPA-FIAD`.

Important layers:

- `Presentacion/Program.cs`: dependency injection, CORS, auth, JWT, Identity,
  DbContexts, SignalR, Swagger/Scalar, path base and endpoint mapping.
- `Presentacion/Api/Controllers/Auth/`: auth, users, roles, service clients,
  service-token issuance.
- `Presentacion/Api/Controllers/CE/`: CE catalogs and academic data.
- `Presentacion/Api/Controllers/HU/`: HU-specific service endpoints.
- `Presentacion/Api/Controllers/CE/SALController.cs`: SAL-specific resource
  endpoints.
- `Presentacion/Api/Controllers/EmailController.cs`: Mailgun-backed email.
- `Presentacion/Hubs/`: SignalR hubs and subscribers.
- `Datos/ContextoBD.cs`: CE EF Core model.
- `Datos/Repositorio/` and `Datos/IRepositorios/`: persistence abstraction.
- `Negocios/`: domain/business orchestration.
- `Servicios/`: application services, auth helpers, email, notifications.
- `Entidades/`: model classes, DTOs, AutoMapper profiles, generic response
  types.
- `Utilidades/`: shared helpers.

Key classes/files:

- `Presentacion/Program.cs`
- `Datos/ContextoBD.cs`
- `Presentacion/Api/Controllers/Auth/AuthController.cs`
- `Presentacion/Api/Controllers/Auth/ServiceAuthController.cs`
- `Presentacion/Api/Controllers/Auth/ServiceClientsController.cs`
- `Presentacion/Api/Controllers/CE/NotificacionesController.cs`
- `Presentacion/Api/Controllers/CE/SALController.cs`
- `Presentacion/Api/Controllers/HU/HUAlumnosController.cs`
- `Presentacion/Api/Controllers/HU/HUDocentesController.cs`
- `Presentacion/Api/Controllers/HU/HUPlanEstudioController.cs`

Frontend source root:
`/home/otomi/isyte-backup/Isyte/repos/CEF/SIPA_CE_FRONT`.

Operational source:

- Dockerfile: `SIPA-FIAD/Dockerfile`.
- Harness route: `harness/traefik/dynamic/cef.yml`.
- Workflow: `harness/.github/workflows/cef-backend.yml`.

