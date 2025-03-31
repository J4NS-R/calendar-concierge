import { db } from '$lib/server/db';
import * as schema from '$lib/server/schema';
// @ts-expect-error IDK why this import is flagged
import ICAL from 'ical.js';
import { eq } from 'drizzle-orm';
import { dateLimits } from '$lib/date-management';
import { env } from '$env/dynamic/private';
import type { CleanEvent } from '$lib/types';
import { fromZonedTime } from 'date-fns-tz';

function getEventDetails(ev: ICAL.Component): CleanEvent {

	// Function to do all the dirty timezone parsing of an ical date-time
	function mkDate(ev: ICAL.Component, propName: string): Date {
		const icalDate = ev.getFirstPropertyValue(propName);

		if (icalDate.timezone){ // parse non-ical timezone ourselves

			// Non-standard, but timezones may start with a slash to indicate it's not defined in the ical
			// file itself
			const tzName = icalDate.timezone.startsWith('/') ?
				icalDate.timezone.substring(1) : icalDate.timezone;

			const parsedDate = fromZonedTime(icalDate.toString(), tzName);
			if (isNaN(parsedDate.getTime())){
				throw new Error(`Could not parse date '${icalDate.toString()}' with timezone '${tzName}'`);
			}else{
				return parsedDate;
			}

		}else{ // let ical library parse tz
			return icalDate.toJSDate();
		}
	}

	const summary: string = ev.getFirstPropertyValue('summary');
	const start = mkDate(ev, 'dtstart');
	const end = mkDate(ev, 'dtend');
	return {summary, start, end};
}

function durationH(ev: CleanEvent): number {
	const durMillis = ev.end.getTime() - ev.start.getTime();
	return durMillis / (1000 * 60 * 60);
}

// TODO job manager with something like https://docs.quirrel.dev/getting-started/next-js
// @ts-expect-error request is of type any
export async function POST({ request }) {
	const apiKey = request.headers.get('X-API-Key');
	if (env.VITE_API_KEY !== apiKey) {
		return new Response(JSON.stringify({ error: 'API key mismatch' }), { status: 403 });
	}

	const startLimit = dateLimits.getStartLimit();
	const endLimit = dateLimits.getEndLimit();

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
		const calRoot = new ICAL.Component(parsed);
		const allEvents = calRoot.getAllSubcomponents('vevent');

		const calData = [];
		for (const ev of allEvents) {
			let cleanEvent;
			try {
				cleanEvent = getEventDetails(ev);
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
