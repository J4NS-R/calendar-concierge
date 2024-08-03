import {PUBLIC_FUTURE_DAYS, PUBLIC_PAST_DAYS} from '$env/static/public';

// Define time limits
export const startLimit = new Date();
startLimit.setDate(startLimit.getDate() - parseInt(PUBLIC_PAST_DAYS));
export const endLimit = new Date();
endLimit.setDate(endLimit.getDate() + parseInt(PUBLIC_FUTURE_DAYS));
