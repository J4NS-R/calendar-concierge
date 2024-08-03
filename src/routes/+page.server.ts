import {db} from '$lib/server/db';

export async function load() {
	const busyEvents = await db.query.busyEvents.findMany();

	return {
		calData: busyEvents.map(busyEvent => ({
			start: new Date(busyEvent.start),
			end: new Date(busyEvent.end),
		})),
	}
}
