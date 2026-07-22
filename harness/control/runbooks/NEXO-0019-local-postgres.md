# NEXO-0019 Runbook - Local PostgreSQL

## Purpose

Run a local PostgreSQL database for Nexo durable backend development.

## Start

From the repository root:

```sh
docker compose -f infra/docker-compose.yml up -d nexo-postgres
```

## Validate Backend Configuration

```sh
cd back
npm run db:validate
```

## Apply Migrations

```sh
cd back
npm run db:migrate
```

## Stop

```sh
docker compose -f infra/docker-compose.yml down
```

## Reset Local Data

This deletes the local PostgreSQL volume.

```sh
docker compose -f infra/docker-compose.yml down -v
```

## Local Placeholder Credentials

- Database: `nexo`
- User: `nexo_app`
- Password: `nexo_dev_password_change_me`
- Backend URL:
  `postgresql://nexo_app:nexo_dev_password_change_me@localhost:5432/nexo?schema=public`

These are development placeholders only.
