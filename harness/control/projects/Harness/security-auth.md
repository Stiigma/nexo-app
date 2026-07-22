# Harness Security And Auth

Harness does not issue FIAD application identity, but it can expose or protect
routes, diagnostics, workflows and secrets.

Security surfaces:

- Traefik middleware for headers, rate limits and Swagger basic auth.
- K8s middleware/ingress resources.
- Docker Compose environment wiring.
- GitHub Actions secrets and deploy credentials.
- OpenCode adapters and plugins that read canonical context.
- Scripts that may initialize databases, run deploys or start tunnels.

Sensitive data rules:

- Do not document real `.env` values, SQL dumps, credential PDFs/XLSX,
  service-account JSON, GitHub secrets, deploy keys or `traefik/users`.
- Use names and ownership only in `../../ecosystem/credential-map.md`.
- Any external deploy, push, tunnel, domain/DNS change or secret mutation
  requires explicit user confirmation.

Known risks:

- Historical branch/deploy metadata differs across workflows, project profiles
  and plugin state.
- Swagger/basic-auth middleware can become a false sense of security if routes
  bypass it.
- Scripts can mutate databases or external environments; inspect before
  running.
- The Nexo budget guard only understands `NEXO-*` active-task parsing; FIAD
  context injection is handled by a separate local plugin.

Review triggers:

- Changes to Docker Compose, Traefik, K8s, workflows, deploy scripts,
  OpenCode plugins or credential maps should receive FIAD infra/security
  review before close.

