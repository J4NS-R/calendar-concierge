# Calendar Concierge

Display your free/busy status across as many ICS calendars as you want.

## Config

Via runtime env vars. See [.env.example](.env.example).

## Usage

Insert an ICS url and optionally basic auth creds into the `remote_ics` table.
Find info about DB migration below.

## Development

```sh
npm run dev
```

### DB

```sh
export $(cat .env.local | xargs)
npm run drizzle-generate
npm run drizzle-migrate
```
