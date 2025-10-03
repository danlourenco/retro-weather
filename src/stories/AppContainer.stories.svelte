<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AppContainer from '$lib/components/AppContainer.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';

	import WeatherPanelContainer from '$lib/components/WeatherPanelContainer.svelte';
	import AppTicker from '$lib/components/Ticker.svelte';
	import WeatherPanel from '$lib/components/WeatherPanel.svelte';

	const { Story } = defineMeta({
		title: 'Components/AppContainer',
		component: AppContainer,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	<AppContainer>
		<AppHeader pageTitle="Current Conditions" />
		<WeatherPanelContainer>
			<WeatherPanel>
				<div class="text-left">
					<h1 class="mb-4">72°F</h1>
					<p class="text-2xl">Partly Cloudy</p>
				</div>
			</WeatherPanel>
		</WeatherPanelContainer>
		<AppTicker>Light rain starting in 15 minutes</AppTicker>
	</AppContainer>
</Story>
