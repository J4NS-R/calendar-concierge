import { env } from '$env/dynamic/public';

class DateLimits{
	private readonly startLimit: Date;
	private readonly endLimit: Date;
	constructor() {
		this.startLimit = new Date();
		this.startLimit.setDate(this.startLimit.getDate() - parseInt(env.PUBLIC_PAST_DAYS));
		this.endLimit = new Date();
		this.endLimit.setDate(this.endLimit.getDate() + parseInt(env.PUBLIC_FUTURE_DAYS));
	}

	// This is technically not immutable, but should be treated as such.
	public getStartLimit(): Date{
		return this.startLimit;
	}
	public getEndLimit(): Date{
		return this.endLimit;
	}
}

export const dateLimits = new DateLimits();
