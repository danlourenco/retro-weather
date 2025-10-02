<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import WeatherPanel from '$lib/components/WeatherPanel.svelte';
	import WeatherPanelContainer from '$lib/components/WeatherPanelContainer.svelte';

	const { Story } = defineMeta({
		title: 'Components/WeatherPanelContainer',
		component: WeatherPanelContainer,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	<div class="text-left">
		<h1 class="mb-4">72°F</h1>
		<p class="text-2xl">Partly Cloudy</p>
	</div>
</Story>

<Story name="With Weather Panel">
	<WeatherPanel>
		<div>FRIDAY...SUNNY, WITH A HIGH NEAR 68. NORTHEAST WIND 5 TO 10 MPH.</div>
		<br />
		<div>FRIDAY NIGHT...CLEAR, WITH A LOW AROUND 45.</div>
	</WeatherPanel>
</Story>
