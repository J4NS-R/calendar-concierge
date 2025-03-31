<script>
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	// @ts-expect-error import exists
	import Calendar from '@event-calendar/core';
	// @ts-expect-error import exists
	import TimeGrid from '@event-calendar/time-grid';
	import Toast from 'flowbite-svelte/Toast.svelte';
	import { slide } from 'svelte/transition';
	import InfoCircleSolid from 'flowbite-svelte-icons/InfoCircleSolid.svelte';
	import { dateLimits } from '$lib/date-management';

	// Svelte assigns this via magic
	export let data;
	/** @type Calendar */
	let calendarElement;
	let toastStatus = false;
	let warningMsg = '';
	// Determined at runtime
	let isPortrait = false;
	const calPlugins = [TimeGrid];
	let calOptions;

	function onCalViewChange(info) {
		if (info.end > dateLimits.getEndLimit() ) {
			calendarElement.prev();
			toastStatus = true;
			warningMsg = 'late';
		} else if (info.start < dateLimits.getStartLimit()) {
			calendarElement.next();
			toastStatus = true;
			warningMsg = 'early';
		}
	}

	onMount(() => {
		isPortrait = window.innerWidth < window.innerHeight;

		// https://github.com/vkurko/calendar?tab=readme-ov-file
		calOptions = {
			view: 'timeGridWeek',
			events: data.busyEvents.map(ev => ({ ...ev, title: 'Busy' })),
			editable: false,
			hiddenDays: isPortrait ? [0, 6] : [], // hide weekend on mobile
			nowIndicator: true,
			height: '80vh',
			datesSet: onCalViewChange,
			scrollTime: '09:00:00'
		};
	});

</script>

<svelte:head>
	<title>Meet with {env.PUBLIC_NAME}</title>
	<meta name="description" content="Check {env.PUBLIC_NAME}'s calendar for availability" />
</svelte:head>

<h2 class="font-bold">Meet with {env.PUBLIC_NAME}</h2>
{#if env.PUBLIC_EMAIL}
	<p class="mt-2 text-sm">
		Feel free to send a meeting invite to
		<span class="underline font-mono">{env.PUBLIC_EMAIL}</span>
		in any gap in my calendar.
	</p>
{/if}
<p class="mb-2 text-sm">In-person meetings only by arrangement.</p>

<Toast bind:toastStatus transition={slide} position="top-right" color="blue" class="z-50">
	<InfoCircleSolid slot="icon" class="w-5 h-5" />
	{#if warningMsg === 'early'}
		Cannot go further back into the calendar history.
	{/if}
	{#if warningMsg === 'late'}
		Cannot go further into the future.
	{/if}
</Toast>

<div>
	<Calendar bind:this={calendarElement} plugins={calPlugins} options={calOptions} />
</div>
<div class="flex mt-2">
	<p>Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
	<div class="flex-grow" />
	<p>Powered by
		<a href="https://gitlab.com/J4NS-R/calendar-concierge" target="_blank" class="text-blue-300">Calendar Concierge</a>
	</p>
</div>
