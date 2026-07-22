# HU Endpoints

Base path through Harness: `/hu`. API routes are normally `/hu/api/...`.
Source entry point:
`/home/otomi/isyte-backup/Isyte/repos/HU/HU-Backend/Presentacion/Program.cs`.

| Method | Route | Source | Auth | DTOs/dependencies |
| --- | --- | --- | --- | --- |
| POST | `/api/HoraUniversitaria/crear` | `Presentacion/Controllers/HoraUniversitariaController.cs` | JWT | `HoraUniversitariaCrearDTO` |
| PUT | `/api/HoraUniversitaria/actualizar/{idHoraUniversitaria}` | same | JWT | `HoraUniversitariaDTO`/update DTO |
| DELETE | `/api/HoraUniversitaria/borrar/{idHoraUniversitaria}` | same | JWT | local repository |
| GET | `/api/HoraUniversitaria/buscar-por-id/{idHoraUniversitaria}` | same | JWT | `HoraUniversitariaDTO` |
| GET | `/api/HoraUniversitaria/listar` | same | JWT | local repository |
| GET | `/api/HoraUniversitaria/ultima` | same | JWT | local repository |
| POST | `/api/Actividad/crear` | `Presentacion/Controllers/ActividadController.cs` | JWT | `ActividadCrearDTO`, CE refs |
| PUT | `/api/Actividad/actualizar/{idActividad}` | same | JWT | `ActividadActualizarDTO` |
| DELETE | `/api/Actividad/borrar/{idActividad}` | same | JWT | local repository |
| GET | `/api/Actividad/buscar-por-id/{idActividad}` | same | JWT | `ActividadDTO` |
| GET | `/api/Actividad/por-hora-universitaria/{idHoraUniversitaria}` | same | JWT | activity list |
| GET | `/api/Actividad/por-asistencia-alumno/{idAlumno}` | same | JWT | attendance relation |
| GET | `/api/Actividad/cartelera` | same | JWT/public depending policy | activity poster/list data |
| GET | `/api/Actividad/mi-historial` | same | JWT | current user claims |
| POST | `/api/Asistencia/crear` | `Presentacion/Controllers/AsistenciaController.cs` | JWT | `AsistenciaCrearDTO` |
| GET | `/api/Asistencia/buscar-por-id/{idAsistencia}` | same | JWT | `AsistenciaDTO` |
| GET | `/api/Asistencia/por-actividad/{idActividad}` | same | JWT | activity attendance |
| GET | `/api/Asistencia/certificados` | same | JWT | certificate view/list |
| POST | `/api/Expositor/crear` | `Presentacion/Controllers/ExpositorController.cs` | JWT | `ExpositorCrearDTO` |
| PUT | `/api/Expositor/actualizar/{idExpositor}` | same | JWT | `ExpositorActualizarDTO` |
| DELETE | `/api/Expositor/borrar/{idExpositor}` | same | JWT | local repository |
| GET | `/api/Expositor/buscar-por-id/{idExpositor}` | same | JWT | `ExpositorDTO` |
| GET | `/api/Expositor/listar` | same | JWT | speaker list |
| GET | `/api/Poster/generar/{idHoraUniversitaria}` | `Presentacion/Controllers/PosterController.cs` | JWT | poster service |
| GET | `/api/Docente/{idPlanEstudio}` | `Presentacion/Controllers/API/DocenteController.cs` | JWT/service | CEF-backed teacher data |
| GET | `/api/PlanEstudio/listar` | `Presentacion/Controllers/API/PlanEstudioController.cs` | JWT/service | CEF-backed plan data |

CEF-backed source clients live in `Servicios/Servicio/API/` and auth helpers in
`Servicios/AuthCE/`.

