# CEF Endpoints

Base path: `/cef`. API routes are normally reached as `/cef/api/...`.
Source entry point: `/home/otomi/isyte-backup/Isyte/repos/CEF/SIPA-FIAD/Presentacion/Program.cs`.

## Auth And Identity

| Method | Route | Source | Auth | DTOs/dependencies |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | `Presentacion/Api/Controllers/Auth/AuthController.cs` | public/admin depending action | Identity user DTOs, `UserManager`, roles |
| POST | `/api/auth/login` | `Presentacion/Api/Controllers/Auth/AuthController.cs` | public | login DTO, JWT, refresh token |
| GET | `/api/auth/me` | `Presentacion/Api/Controllers/Auth/AuthController.cs` | JWT/cookie | current user claims |
| GET | `/api/auth/me/minimal` | `Presentacion/Api/Controllers/Auth/AuthController.cs` | JWT/cookie | minimal user DTO |
| POST | `/api/auth/refresh` | `Presentacion/Api/Controllers/Auth/AuthController.cs` | refresh token | `RefreshToken` |
| POST | `/api/auth/logout` | `Presentacion/Api/Controllers/Auth/AuthController.cs` | JWT/cookie | refresh-token revoke |
| POST | `/api/auth/revoke/{token}` | `Presentacion/Api/Controllers/Auth/AuthController.cs` | JWT/admin pattern | `RefreshToken` |
| GET | `/api/auth/check` | `Presentacion/Api/Controllers/Auth/AuthController.cs` | JWT/cookie | auth status |
| GET | `/api/auth/validate` | `Presentacion/Api/Controllers/Auth/AuthController.cs` | JWT/cookie | token validation |
| POST | `/api/auth/service-token` | `Presentacion/Api/Controllers/Auth/ServiceAuthController.cs` | client credentials | `ServiceClient`, JWT |
| CRUD | `/api/auth/service-clients` | `Presentacion/Api/Controllers/Auth/ServiceClientsController.cs` | admin | service client DTOs |
| CRUD + assign | `/api/Roles...` | `Presentacion/Api/Controllers/Auth/RolesController.cs` | admin/service endpoints | Identity roles |
| CRUD + lookup | `/api/Usuarios...` | `Presentacion/Api/Controllers/Auth/UsuariosController.cs` | admin/service endpoints | Identity users |

## CE Master Data

| Area | Route family | Source | Notes |
| --- | --- | --- | --- |
| Students | `/api/Alumnos` | `Presentacion/Api/Controllers/CE/AlumnosController.cs` | CRUD/list/search plus `/service` and batch id endpoints for services |
| Teachers | `/api/Docentes` | `Presentacion/Api/Controllers/CE/DocentesController.cs` | CRUD/list/search/minimal/service and role-user mapping |
| Careers | `/api/Carreras` | `Presentacion/Api/Controllers/CE/CarrerasController.cs` | career catalog and search |
| Study plans | `/api/PlanEstudio` | `Presentacion/Api/Controllers/CE/PlanEstudioController.cs` | CRUD/search/pagination/service/batch ids |
| Plan subjects | `/api/PlanEstudioMateria` | `Presentacion/Api/Controllers/CE/PlanEstudioMateriaController.cs` | plan-subject relations |
| Subjects | `/api/Materias` | `Presentacion/Api/Controllers/CE/MateriasController.cs` | CRUD/search/pagination |
| Subject units/topics/practices | `/api/MateriaUnidades`, `/api/MateriaTemas`, `/api/MateriaPracticas` | matching CE controllers | curriculum details |
| Periods | `/api/Periodos` | `Presentacion/Api/Controllers/CE/PeriodosController.cs` | period CRUD and lookup |
| Catalogs | `/api/CE/Catalogos/*`, `/api/GNL/*`, `/api/TipoMateria`, `/api/NivelAcademico` | catalog controllers | categories, appointments, sex, civil status, PRODEP, SNII, schooling |
| Audit | `/api/CarreraBitacora`, `/api/PlanEstudioBitacora` | bitacora controllers | change history |

## HU Service Endpoints

| Method | Route | Source | Consumer |
| --- | --- | --- | --- |
| GET | `/api/Alumnos/HU/por-id/{idAlumno}/service` | `Presentacion/Api/Controllers/HU/HUAlumnosController.cs` | HU |
| GET | `/api/Alumnos/HU/por-matricula/{matricula}/service` | `Presentacion/Api/Controllers/HU/HUAlumnosController.cs` | HU |
| GET | `/api/Alumnos/HU/por-usuario/{idUsuario}/service` | `Presentacion/Api/Controllers/HU/HUAlumnosController.cs` | HU |
| PUT | `/api/Alumnos/HU/ids` | `Presentacion/Api/Controllers/HU/HUAlumnosController.cs` | HU |
| GET | `/api/Docentes/HU/por-id/{idDocente}/service` | `Presentacion/Api/Controllers/HU/HUDocentesController.cs` | HU |
| GET | `/api/Docentes/HU/por-plan/{idPlanEstudio}/service` | `Presentacion/Api/Controllers/HU/HUDocentesController.cs` | HU |
| PUT | `/api/Docentes/HU/ids` | `Presentacion/Api/Controllers/HU/HUDocentesController.cs` | HU |
| GET | `/api/PlanEstudio/HU/por-id/{idPlan}/service` | `Presentacion/Api/Controllers/HU/HUPlanEstudioController.cs` | HU |
| GET | `/api/PlanEstudio/HU/todos/service` | `Presentacion/Api/Controllers/HU/HUPlanEstudioController.cs` | HU |
| PUT | `/api/PlanEstudio/HU/ids` | `Presentacion/Api/Controllers/HU/HUPlanEstudioController.cs` | HU |

## SAL Service Endpoints

| Method | Route | Source | Consumer |
| --- | --- | --- | --- |
| GET | `/api/SAL/info/{idUsuario}` | `Presentacion/Api/Controllers/CE/SALController.cs` | SAL |
| GET | `/api/SAL/info/{idUsuario}prueba` | `Presentacion/Api/Controllers/CE/SALController.cs` | SAL test path |
| GET | `/api/SAL/roles-administrativos` | `Presentacion/Api/Controllers/CE/SALController.cs` | SAL |
| GET | `/api/SAL/coordinador/{idUsuario}/{idPlanEstudioDocente}/service` | `Presentacion/Api/Controllers/CE/SALController.cs` | SAL |

## Email And Notifications

| Method | Route | Source | Dependencies |
| --- | --- | --- | --- |
| POST | `/api/Email` | `Presentacion/Api/Controllers/EmailController.cs` | Mailgun |
| POST | `/api/Email/batch` | `Presentacion/Api/Controllers/EmailController.cs` | Mailgun |
| POST | `/api/Email/template` | `Presentacion/Api/Controllers/EmailController.cs` | Mailgun |
| POST | `/api/Email/service` | `Presentacion/Api/Controllers/EmailController.cs` | service token + Mailgun |
| GET | `/api/Email/validate` | `Presentacion/Api/Controllers/EmailController.cs` | Mailgun config validation |
| CRUD/state | `/api/Notificaciones...` | `Presentacion/Api/Controllers/CE/NotificacionesController.cs` | SignalR, notification tables |
| Hub | `/hubs/notificaciones` | `Presentacion/Program.cs`, `Presentacion/Hubs/*` | SignalR |
| Hub | `/hubs/sal` | `Presentacion/Program.cs`, `Presentacion/Hubs/*` | SignalR |

