# SAL Endpoints

Base path through Harness: `/sal`. API routes are normally `/sal/api/...`.
Source entry point:
`/home/otomi/isyte-backup/Isyte/repos/SAL/SIPA-SAL/SIPA-SAL/Program.cs`.

## SolicitudSalida

Source: `SIPA-SAL/Controllers/SolicitudSalidaController.cs`.

| Method | Route | Purpose | Auth/dependencies |
| --- | --- | --- | --- |
| POST | `/api/SolicitudSalida` | create request | JWT, CEF user/role context |
| PUT | `/api/SolicitudSalida` | update request | JWT |
| DELETE | `/api/SolicitudSalida/{id}` | delete/archive path | JWT |
| GET | `/api/SolicitudSalida/{id:int}` | get by id | JWT |
| POST | `/api/SolicitudSalida/{id}/archivar` | archive | JWT |
| POST | `/api/SolicitudSalida/{id}/favorito` | mark favorite | JWT |
| DELETE | `/api/SolicitudSalida/{id}/favorito` | remove favorite | JWT |
| GET | `/api/SolicitudSalida/{id}/favorito` | favorite status | JWT |
| GET | `/api/SolicitudSalida/mis-favoritas` | current user favorites | JWT |
| GET | `/api/SolicitudSalida` | list | JWT |
| GET | `/api/SolicitudSalida/filtrar` | query filter | JWT |
| POST | `/api/SolicitudSalida/filtrar` | body filter | JWT |
| GET | `/api/SolicitudSalida/buscar` | search | JWT |
| GET | `/api/SolicitudSalida/docente` | teacher view | JWT role |
| GET | `/api/SolicitudSalida/docente/{idDocente}/visibles` | visible by teacher | JWT role |
| GET | `/api/SolicitudSalida/usuario` | user view | JWT |
| GET | `/api/SolicitudSalida/historial/coordinador` | coordinator history | JWT role |
| GET | `/api/SolicitudSalida/coordinador/carrera/{idCarrera}` | coordinator career view | JWT role |
| GET | `/api/SolicitudSalida/historial/director` | director history | JWT role |
| GET | `/api/SolicitudSalida/historial/administrativo` | admin history | JWT role |
| GET | `/api/SolicitudSalida/historial/docente` | teacher history | JWT role |
| GET | `/api/SolicitudSalida/historial/coordinador-pe` | program coordinator history | JWT role |
| GET | `/api/SolicitudSalida/carrera/{idCarrera}` | by career | JWT role |
| GET | `/api/SolicitudSalida/conteo` | global counts | JWT |
| GET | `/api/SolicitudSalida/conteo/docente` | teacher counts | JWT |
| GET | `/api/SolicitudSalida/estado/{idEstado}` | by state | JWT |
| GET | `/api/SolicitudSalida/{id}/existe` | existence by id | JWT |
| GET | `/api/SolicitudSalida/folio/{folio}/existe` | existence by folio | JWT |
| GET | `/api/SolicitudSalida/mis-solicitudes` | current user requests | JWT |
| POST | `/api/SolicitudSalida/{idSolicitud}/rechazar` | reject | JWT role |
| POST | `/api/SolicitudSalida/{idSolicitud}/firmar` | sign | JWT role |
| POST | `/api/SolicitudSalida/test/subir-archivo-prueba/{idSolicitud}` | test upload path | JWT, Drive |
| GET | `/api/SolicitudSalida/autorizando` | authorizing queue | JWT role |
| GET | `/api/SolicitudSalida/proximas` | upcoming requests | JWT |
| GET | `/api/SolicitudSalida/metricas` | metrics | JWT role |
| GET | `/api/SolicitudSalida/resumen-pendientes/docente` | teacher pending summary | JWT |
| POST | `/api/SolicitudSalida/{idSolicitud}/subir-lista-seguro` | upload insurance list | JWT, Drive |
| GET | `/api/SolicitudSalida/{idSolicitud}/descargar-lista-seguro` | download insurance list | JWT, Drive |

## Files And Reports

| Method | Route | Source | Dependencies |
| --- | --- | --- | --- |
| POST | `/api/ArchivoSolicitud/{idSolicitud}/{idTipoArchivo}` | `SIPA-SAL/Controllers/ArchivoSolicitudController.cs` | JWT, Google Drive |
| GET | `/api/ArchivoSolicitud/solicitud/{idSolicitud}` | same | JWT |
| GET | `/api/ArchivoSolicitud/{idArchivo}/descargar` | same | JWT, Google Drive |
| DELETE | `/api/ArchivoSolicitud/{idArchivo}` | same | JWT, Google Drive |
| POST | `/api/reportes/{idSolicitud}/seguro-facultativo` | `SIPA-SAL/Controllers/ReportesController.cs` | JWT, Drive |
| POST | `/api/reportes/{idSolicitud}/oficio` | same | JWT, PDF/Drive |
| POST | `/api/reportes/{idSolicitud}/oficio/generar` | same | JWT, PDF/Drive |
| POST | `/api/reportes/{idSolicitud}/reporte-actividades` | same | JWT, Drive |
| GET | `/api/reportes/{idSolicitud}/reporte-actividades/control` | same | JWT |
| GET | `/api/reportes/seguimiento` | same | JWT role |
| GET | `/api/reportes/docente/mis-reportes` | same | JWT |
| POST | `/api/reportes/{idSolicitud}/reporte-actividades/prorroga` | same | JWT |
| POST | `/api/reportes/{idSolicitud}/reporte-actividades/solicitar-prorroga` | same | JWT |
| GET | `/api/reportes/{idSolicitud}/reporte-actividades/prorrogas` | same | JWT |
| POST | `/api/reportes/{idSolicitud}/documento-invitacion` | same | JWT, Drive |
| POST | `/api/reportes/{idSolicitud}/encuadre-probatorio` | same | JWT, Drive |
| POST | `/api/reportes/{idSolicitud}/porte-actividades` | same | JWT, Drive |
| GET | `/api/reportes/{idSolicitud}/descargar/{tipoDocumento}` | same | JWT, Drive |

## Catalogs And History

| Method | Route | Source | Notes |
| --- | --- | --- | --- |
| CRUD/search | `/api/EstadoSolicitudSalida...` | `SIPA-SAL/Controllers/EstadoSolicitudSalidaController.cs` | state catalog |
| GET | `/api/SolicitudBitacora/solicitud/{idSolicitud}` | `SIPA-SAL/Controllers/SolicitudBitacoraController.cs` | request history |
| GET | `/api/SolicitudBitacora/{idBitacora}` | same | history by id |
| GET | `/api/TipoActividad`, `/activos`, `/{id:int}` | `SIPA-SAL/Controllers/TipoActividadController.cs` | activity type catalog |
| GET | `/api/TipoArchivo`, `/{id:int}` | `SIPA-SAL/Controllers/TipoArchivoController.cs` | file type catalog |
| GET | `/api/TipoRecurso`, `/{id:int}` | `SIPA-SAL/Controllers/TipoRecursoController.cs` | resource type catalog |

Main DTO roots:

- `Entidades/DTOs/Solicitud/`
- `Entidades/DTOs/Archivos/`
- `Entidades/DTOs/Reportes/`
- `Entidades/DTOs/EstadoSolicitud/`
- `Entidades/DTOs/CE/`

