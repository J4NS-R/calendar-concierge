# Calendar Concierge

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
