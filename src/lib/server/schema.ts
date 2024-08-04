// https://orm.drizzle.team/docs/sql-schema-declaration

import { pgTable, serial, text, integer, timestamp} from 'drizzle-orm/pg-core';

export const remoteIcs = pgTable('remote_ics', {
	// https://orm.drizzle.team/docs/column-types/pg
	id: serial('id').primaryKey(),
	url: text('url').notNull(),
	username: text('username'),
	password: text('password'),
});

export const busyEvents = pgTable('busy_events', {
	id: serial('id').primaryKey(),
	remoteIcsId: integer('remote_ics_id').references(() => remoteIcs.id),
	start: timestamp('start').notNull(),
	end: timestamp('end').notNull(),
});
