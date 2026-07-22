# FIAD Ecosystem Overview

## Purpose

FIAD is an ecosystem of academic systems coordinated by the Harness:

- **CEF / Control Escolar** is the backbone. It owns authentication, roles,
  users, core academic master data, notifications, email, and SignalR hubs.
- **HU / Horas Universitarias** consumes CEF auth and academic data to manage
  university-hour periods, activities, attendance, exhibitors, posters, and
  certificates.
- **SAL / Salidas y Autorizaciones** consumes CEF auth and academic data to
  manage academic outing requests, authorization workflows, documents,
  signatures, notifications, Google Drive files, and activity reports.
- **Harness** owns local orchestration, Docker, K3d/K8s, Traefik, CI/CD
  workflow conventions, scripts, and the canonical control plane.

## Source Roots

| Project | Source root | Canonical profile |
| --- | --- | --- |
| CEF | `/home/otomi/isyte-backup/Isyte/repos/CEF` | `projects/CEF/profile.md` |
| HU | `/home/otomi/isyte-backup/Isyte/repos/HU` | `projects/HU/profile.md` |
| SAL | `/home/otomi/isyte-backup/Isyte/repos/SAL` | `projects/SAL/profile.md` |
| Harness | `/home/otomi/isyte-backup/Isyte/harness` | `projects/Harness/profile.md` |

## Local Shape

The operational Harness runs the stack behind Traefik using path prefixes:

- `/cef` routes CEF frontend and `/cef/api` routes CEF API.
- `/cef/hubs/notificaciones` and `/cef/hubs/sal` route CEF SignalR hubs.
- `/hu` routes HU frontend and `/hu/api` routes HU API.
- `/sal` routes SAL frontend and `/sal/api` routes SAL API.

PostgreSQL is shared at the container level. Historical Docker files sometimes
use one shared database name and sometimes separate `cefdb`, `hudb`, and
`saldb`. Treat that as a known inconsistency and verify before running local DB
scripts.

## Auth Model

CEF issues auth cookies/JWTs for users and service tokens for backend-to-backend
clients. HU and SAL validate CEF-issued JWTs from `accessToken` cookies or
Bearer headers. HU and SAL use client credentials to call protected CEF resource
API endpoints.

## Source Evidence

- CEF auth and hubs: `repos/CEF/SIPA-FIAD/Presentacion/Program.cs`
- CEF service clients: `repos/CEF/SIPA-FIAD/Entidades/Auth/Modelo/ServiceClient.cs`
- HU JWT and Resource API clients: `repos/HU/HU-Backend/Presentacion/Program.cs`
- SAL JWT, Resource API clients, Google Drive: `repos/SAL/SIPA-SAL/SIPA-SAL/Program.cs`
- Traefik routes: `harness/traefik/dynamic/{cef,hu,sal,auth}.yml`
- Local compose: `harness/docker/docker-compose.yml`
- Scripts: `harness/Makefile` and `harness/scripts/`

## How To Start

1. Run `fiad:resume` or read this file.
2. Open `integrations.md` for cross-project communication.
3. Open `projects/<Project>/profile.md` for the target project.
4. Use `local-dotnet-service-playbook.md` when adding a new local .NET service.
5. Use `credential-map.md` before touching auth, env, Drive, email, or deploy.
