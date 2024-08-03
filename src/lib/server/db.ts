import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { VITE_PG_HOST, VITE_PG_USER, VITE_PG_PASS, VITE_PG_DB } from '$env/static/private';
import * as schema from './schema';


const client = postgres(
	`postgres://${VITE_PG_USER}:${VITE_PG_PASS}@${VITE_PG_HOST}:5432/${VITE_PG_DB}`,
	{ max: 1 }
);

export const db = drizzle(client, {schema});
