# CEF Domain Model

Primary DbContexts:

- Identity context: registered in `Presentacion/Program.cs` as
  `ApplicationDbContext`.
- CE context: `/home/otomi/isyte-backup/Isyte/repos/CEF/SIPA-FIAD/Datos/ContextoBD.cs`
  as `D_ContextoBD`.

Core identity/auth entities:

- ASP.NET Identity user/role entities through `ApplicationDbContext`.
- `RefreshToken` for refresh-token persistence.
- `ServiceClient` for local backend-to-backend client credentials.

CE academic entities in `D_ContextoBD`:

- Careers and plans: `E_Carrera`, `E_PlanEstudio`,
  `E_PlanDeEstudioMateria`.
- Teachers and students: `E_Docente`, `E_Alumno`.
- Subjects/curriculum: `E_Materia`, `E_MateriaUnidad`, `E_MateriaTema`,
  `E_MateriaPracticasTaller`, `E_MateriaAtributoEgreso`, `E_TipoMateria`.
- Teacher catalogs: `E_Nombramiento`, `E_Categoria`, `E_NivelAcademico`.
- General catalogs: `E_Sexo`, `E_EstadoCivil`, `E_PRODEP`, `E_SNII`,
  `E_Escolaridad`, `Periodosp`.
- Audit: `E_CarreraBitacora`, `E_MateriaBitacora`,
  `E_PlanEstudioBitacora`.
- Notifications: `E_Notificacion`, `E_NotificacionDestinatario`,
  `E_NotificacionEstadoUsuario`.

Relationship shape:

- Study plans belong to careers and relate to many subjects through
  `E_PlanDeEstudioMateria`.
- Subjects have units, topics, workshops/practices and graduate attributes.
- Teachers/students are linked to Identity users for auth and role-driven
  access.
- Notifications have recipients and per-user state.
- Service clients are independent auth principals for HU/SAL backend calls.

DTO/mapping evidence:

- DTOs and profiles live under
  `/home/otomi/isyte-backup/Isyte/repos/CEF/SIPA-FIAD/Entidades/`.
- Repositories live under
  `/home/otomi/isyte-backup/Isyte/repos/CEF/SIPA-FIAD/Datos/`.
- Business/services live under `Negocios/` and `Servicios/`.

