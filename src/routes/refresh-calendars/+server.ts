import {db} from '$lib/server/db';
import * as schema from '$lib/server/schema';
import ical from 'node-ical';
import ICAL from "ical.js";
import {eq} from 'drizzle-orm'

function getEventDetails(ev: [any]){
	function getDeet(ev: [any], property: string): string{
		const filtered = ev.filter(deet => deet[0] === property);
		if (filtered.length === 0){
			throw new Error(`Could not find property ${property} in event!`);
		}
		return filtered[0][3];
	}

	const summary = getDeet(ev, 'summary');
	const start = new Date(getDeet(ev, 'dtstart'));
	const end = new Date(getDeet(ev, 'dtend'));
	return {summary, start, end};
}

export async function POST(){
	const remoteIcss = await db.query.remoteIcs.findMany();

	for (const remoteIcs of remoteIcss){
		console.log('Processing: ' + remoteIcs.url);

		const headers = new Headers();
		if (remoteIcs.password){
			const userPass = `${remoteIcs.username}:${remoteIcs.password}`;
			headers.set('Authorization', `Basic ${btoa(userPass)}`);
		}

		const resp = await fetch(remoteIcs.url, {
			method: 'GET',
			headers,
		});

		// https://github.com/kewisch/ical.js
		const parsed = ICAL.parse(await resp.text());
		const allEvents = parsed[2];

		// Define time limits
		const startLimit = new Date();
		startLimit.setDate(startLimit.getDate()-7);
		const endLimit = new Date();
		endLimit.setDate(endLimit.getDate()+14);

		const calData = [];
		for (const ev of allEvents) {
			if (ev[0] !== 'vevent') continue;

			let cleanEvent;
			try {
				cleanEvent = getEventDetails(ev[1]);
			}catch(err){
				console.log('Failed to get event details! Skipping...');
				console.log(err);
				console.log('Event data:')
				console.log(ev)
				continue
			}

			if (cleanEvent.end >= startLimit && cleanEvent.start <= endLimit) {
				calData.push(cleanEvent);
			}
		}

		// Clear the old events
		console.log('Clearing events with ICS_id='+remoteIcs.id);
		await db.delete(schema.busyEvents).where(eq(schema.busyEvents.remoteIcsId, remoteIcs.id));
		// Insert new events
		for(const ev of calData){
			console.log('Inserting event '+ev.summary);
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