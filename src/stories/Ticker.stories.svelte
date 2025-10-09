<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Ticker from '$lib/components/Ticker.svelte';

	const { Story } = defineMeta({
		title: 'Components/Ticker',
		component: Ticker,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: 'select',
				options: ['default', 'hazard'],
				description: 'Visual style variant'
			},
			mode: {
				control: 'select',
				options: ['cycle', 'scroll'],
				description: 'Behavior mode'
			},
			messages: {
				control: 'object',
				description: 'Array of messages to display'
			},
			cycleInterval: {
				control: 'number',
				description: 'Milliseconds between message changes (cycle mode)'
			},
			scrollSpeed: {
				control: 'number',
				description: 'Pixels per second (scroll mode)'
			}
		}
	});
</script>

<Story
	name="Default Cycling"
	args={{
		messages: ['Temperature: 72°F', 'Humidity: 65%', 'Wind: 5 MPH NW', 'Pressure: 30.12 in']
	}}
>
</Story>

<Story
	name="Hazard Cycling"
	args={{
		variant: 'hazard',
		messages: ['SEVERE THUNDERSTORM WARNING', 'TORNADO WATCH IN EFFECT', 'FLASH FLOOD WARNING']
	}}
>
</Story>

<Story
	name="Default Scrolling"
	args={{
		mode: 'scroll',
		messages: [
			'Current conditions: Partly cloudy with a chance of showers later this evening'
		],
		scrollSpeed: 5
	}}
>
</Story>

<Story
	name="Hazard Scrolling"
	args={{
		variant: 'hazard',
		mode: 'scroll',
		messages: [
			'TORNADO WARNING - SEEK SHELTER IMMEDIATELY',
			'SEVERE WEATHER ALERT',
			'TAKE COVER NOW'
		],
		scrollSpeed: 8
	}}
>
</Story>

<Story
	name="Fast Cycling"
	args={{
		messages: ['Message 1', 'Message 2', 'Message 3', 'Message 4'],
		cycleInterval: 2000
	}}
>
</Story>

<Story
	name="Fast Scroll"
	args={{
		mode: 'scroll',
		messages: ['This message is scrolling at maximum speed across the ticker'],
		scrollSpeed: 10
	}}
>
</Story>
