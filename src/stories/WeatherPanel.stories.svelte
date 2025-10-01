<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import WeatherPanel from '$lib/components/WeatherPanel.svelte';

	const { Story } = defineMeta({
		title: 'Components/WeatherPanel',
		component: WeatherPanel,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<Story name="Default">
	<div>TONIGHT...MOSTLY CLEAR, WITH A LOW AROUND 48. NORTH WIND 3 TO 8 MPH.</div>
</Story>

<Story name="Extended Forecast">
	<div>FRIDAY...SUNNY, WITH A HIGH NEAR 68. NORTHEAST WIND 5 TO 10 MPH.</div>
	<div>FRIDAY NIGHT...CLEAR, WITH A LOW AROUND 45.</div>
</Story>

<Story name="Weather Alert">
	<div>WINTER STORM WARNING IN EFFECT FROM 6 PM THIS EVENING TO 6 AM EST SATURDAY.</div>
	<div>HEAVY SNOW EXPECTED. TOTAL SNOW ACCUMULATIONS OF 8 TO 12 INCHES.</div>
</Story>
