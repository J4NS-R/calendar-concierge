import { env } from '$env/dynamic/public';

// Define time limits
export const startLimit = new Date();
startLimit.setDate(startLimit.getDate() - parseInt(env.PUBLIC_PAST_DAYS));
export const endLimit = new Date();
endLimit.setDate(endLimit.getDate() + parseInt(env.PUBLIC_FUTURE_DAYS));
