# Calendar Concierge

## Config

Via runtime env vars. See [.env.example](.env.example).

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
