# Nexo Local Infrastructure

Local Docker infrastructure for durable Nexo development.

## PostgreSQL

Start the local database from the repository root:

```sh
docker compose -f infra/docker-compose.yml up -d nexo-postgres
```

The backend local `.env` is configured for:

```text
DATABASE_URL=postgresql://nexo_app:nexo_dev_password_change_me@localhost:5432/nexo?schema=public
```

The password is a development placeholder only. Replace it before any shared or
production environment is created.

After the container is healthy, apply Prisma migrations:

```sh
cd back
npm run db:migrate
```

Stop the local database:

```sh
docker compose -f infra/docker-compose.yml down
```

Remove the local database volume:

```sh
docker compose -f infra/docker-compose.yml down -v
```
