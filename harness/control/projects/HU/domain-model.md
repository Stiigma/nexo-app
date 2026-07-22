# HU Domain Model

Primary DbContext:

- `/home/otomi/isyte-backup/Isyte/repos/HU/HU-Backend/Datos/ContextoBD.cs`

HU-owned entities:

- `E_HoraUniversitaria`: a HU cycle/event container.
- `E_Actividad`: individual activities inside a HU event.
- `E_Asistencia`: student attendance records.
- `E_Expositor`: speakers/presenters.
- `E_EstadoActividad`: activity status catalog.

CEF mirror/reference entities in the same DbContext:

- `E_Carrera`
- `E_Docente`
- `E_Materia`
- `E_MateriaTema`
- `E_MateriaUnidad`
- `E_MateriaPracticasTaller`
- `E_MateriaAtributoEgreso`
- `E_PlanEstudio`
- `E_Nombramiento`
- `E_Categoria`
- `E_NivelAcademico`
- `E_Sexo`
- `E_EstadoCivil`
- `E_PRODEP`
- `E_SNII`
- `E_Escolaridad`
- `E_Alumno`
- `E_Periodo`

DTOs and mappings:

- HU DTOs: `Entidades/DTOs/HoraUniversitaria`, `Actividad`, `Asistencia`,
  `Expositor`, `Alumno`.
- CE DTOs: `Entidades/CE/DTOs/*`.
- AutoMapper profiles: `Entidades/Perfiles/*` and `Entidades/CE/Perfiles/*`.

Relationship shape:

- A `HoraUniversitaria` groups activities.
- Activities can have expositors and attendance.
- Attendance ties activity participation to CE student identity.
- CE data is read from CEF through API clients and/or synchronized into local
  reference tables.

