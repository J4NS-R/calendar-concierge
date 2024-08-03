<script>
	export let data;
	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';

	// https://github.com/vkurko/calendar?tab=readme-ov-file
	let plugins = [TimeGrid];
	let options = {
		view: 'timeGridWeek',
		events: data.calData.map(ev => ({...ev, title: 'Busy'})),
		editable: false,
		//hiddenDays: [0, 6], // weekend
		nowIndicator: true,
		height: '80vh',
	};
</script>

<h1>Calendar Concierge</h1>

<Calendar {plugins} {options} />
