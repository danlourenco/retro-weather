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

<Story name="Responsive Layout Test">
	<div class="min-h-screen w-full bg-blue-900">
		<AppContainer scanlinesEnabled={true}>
			<AppHeader pageTitle="Local Forecast" />
			<WeatherPanelContainer>
				<WeatherPanel>
					<div class="flex h-full flex-col justify-center space-y-4 text-left">
						<div class="text-6xl">THIS AFTERNOON...SUNNY, WITH A</div>
						<div class="text-6xl">HIGH NEAR 71. SOUTHWEST WIND</div>
						<div class="text-6xl">AROUND 6 MPH.</div>
					</div>
				</WeatherPanel>
			</WeatherPanelContainer>
			<AppTicker>Conditions at Norwood</AppTicker>
		</AppContainer>
	</div>
</Story>
