import { building } from '$app/environment';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { VITE_PG_DB, VITE_PG_HOST, VITE_PG_PASS, VITE_PG_USER } from '$env/static/private';
import * as schema from './schema';

let drizz = null;
if (!building) {
	const client = postgres(
		`postgres://${VITE_PG_USER}:${VITE_PG_PASS}@${VITE_PG_HOST}:5432/${VITE_PG_DB}`,
		{ max: 5 }
	);
	drizz = drizzle(client, { schema });
}

export const db = drizz;
