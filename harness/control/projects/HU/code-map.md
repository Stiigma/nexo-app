# HU Code Map

Backend source root:
`/home/otomi/isyte-backup/Isyte/repos/HU/HU-Backend`.

Important layers:

- `Presentacion/Program.cs`: CORS, JWT validation, policies, EF Core,
  Swagger, CEF client credentials and controller mapping.
- `Presentacion/Controllers/`: HU API controllers.
- `Presentacion/Controllers/API/`: thin endpoints that expose CEF-backed CE
  resource data to the HU frontend.
- `Datos/ContextoBD.cs`: EF Core model.
- `Datos/Repositorio/`: persistence repositories for HU entities.
- `Negocios/Repositorios/`: business orchestration for HU use cases.
- `Servicios/Servicio/`: application service layer for controllers.
- `Servicios/Servicio/API/`: CEF resource API clients.
- `Servicios/AuthCE/`: current user, claims, service token provider, CEF auth
  handler.
- `Entidades/Modelos/`: HU entity classes.
- `Entidades/CE/Modelos/`: CEF mirror entities.
- `Entidades/DTOs/` and `Entidades/CE/DTOs/`: request/response contracts.

Key files:

- `Presentacion/Program.cs`
- `Datos/ContextoBD.cs`
- `Presentacion/Controllers/HoraUniversitariaController.cs`
- `Presentacion/Controllers/ActividadController.cs`
- `Presentacion/Controllers/AsistenciaController.cs`
- `Presentacion/Controllers/ExpositorController.cs`
- `Presentacion/Controllers/PosterController.cs`
- `Servicios/AuthCE/ServiceTokenProvider.cs`

Frontend source root:
`/home/otomi/isyte-backup/Isyte/repos/HU/HU-Frontend`.

Operational source:

- Dockerfile: `HU-Backend/Dockerfile`.
- Harness route: `harness/traefik/dynamic/hu.yml`.
- Workflows: `harness/.github/workflows/hu-backend.yml` and
  `hu-frontend.yml`.

