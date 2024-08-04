import {db} from '$lib/server/db';

export async function load() {
	// https://orm.drizzle.team/docs/rqb
	const busyEvents = await db.query.busyEvents.findMany();

	return {
		busyEvents,
	}
}
