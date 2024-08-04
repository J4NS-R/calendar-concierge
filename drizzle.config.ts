import { defineConfig } from 'drizzle-kit';

// Generate SQL with `drizzle-kit generate`

export default defineConfig({
	schema: './src/lib/server/schema.ts',
	out: './.drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		host: process.env.VITE_PG_HOST,
		user: process.env.VITE_PG_USER,
		password: process.env.VITE_PG_PASS,
		database: process.env.VITE_PG_DB
	}
});
