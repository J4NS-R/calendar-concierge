# Calendar Concierge

Display your free/busy status across as many ICS calendars as you want.

## Deployment

Via docker. See [public images](https://gitlab.com/J4NS-R/calendar-concierge/container_registry)

## Config

Via runtime env vars. See [.env.example](.env.example).

## Usage

Insert an ICS url and optionally basic auth creds into the `remote_ics` table after you have the app deployed.

## Development

```sh
cp .env.example .env.local  # edit as needed
docker compose -f src/test/docker-compose.yaml --env-file .env.local up -d --wait
npm run dev  # http://localhost:5173/
```

### DB schema changes

```sh
export $(cat .env.local | xargs)
npm run drizzle-generate
```

Note that DB migrations happen at runtime.
