// This code runs on server startup
import { db } from '$lib/server/db';
import { migrate } from 'drizzle-orm/postgres-js/migrator';


console.debug('Starting DB migration...');
await migrate(db, { migrationsFolder: './drizzle' });
console.info('Migrations complete');
