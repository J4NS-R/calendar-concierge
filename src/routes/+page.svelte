<script>
	export let data;
	// @ts-expect-error import exists
	import Calendar from '@event-calendar/core';
	// @ts-expect-error import exists
	import TimeGrid from '@event-calendar/time-grid';
	import Toast from 'flowbite-svelte/Toast.svelte';
	import { slide } from 'svelte/transition';
	import { InfoCircleSolid } from 'flowbite-svelte-icons';
	import { endLimit, startLimit } from '$lib/date-management';

	// Svelte assigns this via magic
	let calendarElement;
	let toastStatus = false;
	let warningMsg = "";

	function onCalViewChange(info){
		if (info.end > endLimit){
			calendarElement.prev();
			toastStatus = true;
			warningMsg = 'late';
		}else if (info.start < startLimit){
			calendarElement.next();
			toastStatus = true;
			warningMsg = 'early';
		}
	}

	// https://github.com/vkurko/calendar?tab=readme-ov-file
	let plugins = [TimeGrid];
	let options = {
		view: 'timeGridWeek',
		events: data.busyEvents.map(ev => ({...ev, title: 'Busy'})),
		editable: false,
		//hiddenDays: [0, 6], // weekend
		nowIndicator: true,
		height: '80vh',
		datesSet: onCalViewChange,
		scrollTime: '09:00:00'
	};

</script>

<h1 class="font-bold">Meet with Jans</h1>
<p class="mt-2">
	Feel free to send a meeting invite to
	<span class="underline font-mono">jans (at) rauten.co.za</span>
	in any gap in my calendar.
</p>
<p class="mb-2">In-person meetings only by arrangement.</p>

<Toast bind:toastStatus transition={slide} position="top-right" color="blue">
	<InfoCircleSolid slot="icon" class="w-5 h-5" />
	{#if warningMsg === 'early'}
		Cannot go further back into the calendar history.
	{/if}
	{#if warningMsg === 'late'}
		Cannot go further into the future.
	{/if}
</Toast>

<div>
	<Calendar bind:this={calendarElement} {plugins} {options} />
</div>

<p class="mt-4">Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
