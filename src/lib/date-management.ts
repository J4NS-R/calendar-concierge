import { env } from '$env/dynamic/public';

class DateLimits{
	// Calculate on each call.
	public getStartLimit(): Date{
		const startLimit = new Date();
		startLimit.setDate(startLimit.getDate() - parseInt(env.PUBLIC_PAST_DAYS));
		return startLimit;
	}
	public getEndLimit(): Date{
		const endLimit = new Date();
		endLimit.setDate(endLimit.getDate() + parseInt(env.PUBLIC_FUTURE_DAYS));
		return endLimit;
	}
}

export const dateLimits = new DateLimits();
