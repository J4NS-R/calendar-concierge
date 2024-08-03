import {db} from '$lib/server/db';
import * as schema from '$lib/server/schema';
import ical from 'node-ical';
import {eq} from 'drizzle-orm'

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

		// https://www.npmjs.com/package/node-ical
		const parsed = ical.parseICS(await resp.text());

		const startLimit = new Date();
		startLimit.setDate(startLimit.getDate()-7);
		const endLimit = new Date();
		endLimit.setDate(endLimit.getDate()+14);

		const calData = [];
		for (const ev of Object.values(parsed)){
				if (ev.type !== 'VEVENT') continue;

				// recurring event
				if (ev.rrule){
					const durMins = Math.round((ev.end.getTime() - ev.start.getTime())/(1000*60));
					const dates = ev.rrule.between(startLimit, endLimit, true);
					// ignoring tz issues for now
					for (const startDate of dates){
						const endDate = new Date(startDate);
						endDate.setMinutes(endDate.getMinutes()+durMins);
						calData.push({
							summary: ev.summary,
							start: startDate,
							end: endDate,
						});
					}

				}else if (ev.end >= startLimit && ev.start <= endLimit)
						calData.push({summary: ev.summary, start: ev.start, end: ev.end});
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
