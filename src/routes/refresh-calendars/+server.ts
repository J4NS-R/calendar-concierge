import { db } from '$lib/server/db';
import * as schema from '$lib/server/schema';
// @ts-expect-error IDK why this import is flagged
import ICAL from 'ical.js';
import { eq } from 'drizzle-orm';
import { endLimit, startLimit } from '$lib/date-management';
import { env } from '$env/dynamic/private';
import type { CleanEvent } from '$lib/types';
import { fromZonedTime } from 'date-fns-tz';

function getEventDetails(ev: []): CleanEvent {
	function getDeet(ev: [], property: string): string|Date {
		const filtered = ev.filter(deet => deet[0] === property);
		if (filtered.length === 0){
			throw new Error(`Could not find property ${property} in event!`);
		}
		if (filtered[0][2] === "date-time"){
			const tzName = filtered[0][1]['tzid'];
			const dateStr = filtered[0][3];
			return fromZonedTime(dateStr, tzName);
		}else{
			return filtered[0][3];
		}
	}

	const summary = getDeet(ev, 'summary') as string;
	const start = getDeet(ev, 'dtstart') as Date;
	const end = getDeet(ev, 'dtend') as Date;
	return {summary, start, end};
}

function durationH(ev: CleanEvent): number {
	const durMillis = ev.end.getTime() - ev.start.getTime();
	return durMillis / (1000 * 60 * 60);
}

// TODO job manager with something like https://docs.quirrel.dev/getting-started/next-js
export async function POST({ request }) {
	const apiKey = request.headers.get('X-API-Key');
	if (env.VITE_API_KEY !== apiKey) {
		return new Response(JSON.stringify({ error: 'API key mismatch' }), { status: 403 });
	}

	const remoteIcss = await db.query.remoteIcs.findMany();

	for (const remoteIcs of remoteIcss){
		console.log('Processing: ' + remoteIcs.url);

		const headers = new Headers();
		if (remoteIcs.password){
			const userPass = `${remoteIcs.username}:${remoteIcs.password}`;
			headers.set('Authorization', `Basic ${btoa(userPass)}`);
		}

		// Build fetch URL
		const separator = remoteIcs.url.indexOf('?') > -1 ? '&' : '?';
		const url = `${remoteIcs.url}${separator}start-min=${startLimit.toISOString().substring(0, 10)}&end-max=${endLimit.toISOString().substring(0, 10)}`
		const resp = await fetch(url, { method: 'GET', headers });

		// https://github.com/kewisch/ical.js
		const parsed = ICAL.parse(await resp.text());
		const allEvents = parsed[2];

		const calData = [];
		for (const ev of allEvents) {
			if (ev[0] !== 'vevent') continue;

			let cleanEvent;
			try {
				cleanEvent = getEventDetails(ev[1]);
			}catch(err){
				// @ts-expect-error err is any
				console.log(`Warning: skipping event. Error: ${err.message}`);
				continue
			}

			if (cleanEvent.end >= startLimit && cleanEvent.start <= endLimit && durationH(cleanEvent) <= 23) {
				calData.push(cleanEvent);
			}
		}

		// Clear the old events
		console.log('Clearing events with ICS_id='+remoteIcs.id);
		await db.delete(schema.busyEvents).where(eq(schema.busyEvents.remoteIcsId, remoteIcs.id));
		// Insert new events
		for(const ev of calData){
			console.log(`Inserting event ${ev.summary} @ ${ev.start.toISOString()}`);
			await db.insert(schema.busyEvents).values({
				remoteIcsId: remoteIcs.id,
				start: ev.start,
				end: ev.end,
			});
		}
	}

	console.log('Done processing remote ICSs');

	return new Response('OK', {status: 200})
}
