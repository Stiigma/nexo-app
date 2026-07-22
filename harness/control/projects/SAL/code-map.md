# SAL Code Map

Backend source root:
`/home/otomi/isyte-backup/Isyte/repos/SAL/SIPA-SAL`.

Important layers:

- `SIPA-SAL/Program.cs`: CORS, PostgreSQL, CEF resource config, Google Drive
  options, JWT validation, DI, hosted services, rate limiting, Swagger and
  controller mapping.
- `SIPA-SAL/Controllers/`: HTTP API controllers.
- `Datos/D_ContextoBD.cs`: EF Core model.
- `Datos/GoogleDrive/`: Drive service, folder repository, upload models.
- `Datos/Repositorios/`: persistence for requests, files, states, resources,
  signatures, reports and activities.
- `Datos/UnitOfWork/`: unit of work wrapper.
- `Negocios/Negocio/`: business rules.
- `Servicios/Auth_CE/`: CEF JWT/current-user/service-token helpers.
- `Servicios/CE/ApiClients/`: CEF clients for users, roles, SAL info, email,
  notifications and teachers.
- `Servicios/BackgroundServices/`: notification queue, report vigency and
  request expiration workers.
- `Servicios/Servicios/Oficios/`: document/PDF generation.
- `Servicios/Servicios/Notificaciones/`: email templates and notification
  observer.
- `Entidades/`: models, DTOs, options, events and profiles.

Key files:

- `SIPA-SAL/Program.cs`
- `Datos/D_ContextoBD.cs`
- `SIPA-SAL/Controllers/SolicitudSalidaController.cs`
- `SIPA-SAL/Controllers/ArchivoSolicitudController.cs`
- `SIPA-SAL/Controllers/ReportesController.cs`
- `Servicios/Auth_CE/ServiceTokenProvider.cs`
- `Servicios/CE/ApiClients/SALApiClient.cs`
- `Datos/GoogleDrive/Factory/GoogleDriveService.cs`
- `Servicios/BackgroundServices/NotificacionQueue/NotificacionesBackgroundService.cs`
- `Servicios/BackgroundServices/Reportes/ReporteActividadesVigenciaBackgroundService.cs`

Frontend source root:
`/home/otomi/isyte-backup/Isyte/repos/SAL/Front_SIPA-SAL`.

Operational source:

- Dockerfile: `SIPA-SAL/Dockerfile`.
- Harness route: `harness/traefik/dynamic/sal.yml`.
- Workflows: `harness/.github/workflows/sal-backend.yml` and
  `sal-frontend.yml`.

