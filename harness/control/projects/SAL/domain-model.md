# SAL Domain Model

Primary DbContext:

- `/home/otomi/isyte-backup/Isyte/repos/SAL/SIPA-SAL/Datos/D_ContextoBD.cs`

Core request entities:

- `E_Solicitud`
- `E_EstadoSolicitudSalida`
- `E_Solicitud_Bitacora`
- `E_SolicitudFavorita`

Resource/file/signature entities:

- `E_TipoRecurso`
- `E_SolicitudRecurso`
- `E_TipoArchivo`
- `E_ArchivoSolicitud`
- `E_TipoFirma`
- `E_FirmaSolicitud`

Activity/report entities:

- `E_TipoActividad`
- `E_SolicitudActividad`
- `E_SolicitudReporteControl`
- `E_SolicitudReporteProrroga`

Enum/reference files:

- `Entidades/Generales/EstadoSolicitudSalida.cs`
- `Entidades/Generales/TipoArchivo.cs`
- `Entidades/Generales/TipoArchiveroSolicitud.cs`
- `Entidades/Generales/TipoDocumentoSolicitud.cs`
- `Entidades/Generales/TipoFirma.cs`
- `Entidades/Generales/TipoRecurso.cs`

Relationship shape:

- `E_Solicitud` is the aggregate root for salida requests.
- Request state transitions produce `E_Solicitud_Bitacora` rows.
- Requests can have resources, activity records, uploaded files, generated
  reports, favorites and signatures.
- File metadata points to Google Drive-managed objects.
- Notification/event classes under `Entidades/Events/Solicitud/` and observer
  services react to request lifecycle changes.

DTO and mapping evidence:

- DTOs live under `Entidades/DTOs/*`.
- AutoMapper profiles live under `Entidades/Profiles/*`.
- Repositories live under `Datos/Repositorios/*`.
- Business services live under `Negocios/Negocio/*` and
  `Servicios/Servicios/*`.

