<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AppContainer from '$lib/components/AppContainer.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import WeatherPanelContainer from '$lib/components/WeatherPanelContainer.svelte';
	import WeatherPanel from '$lib/components/WeatherPanel.svelte';
	import Ticker from '$lib/components/Ticker.svelte';

	const { Story } = defineMeta({
		title: 'Layouts/WeatherLayout',
		tags: ['autodocs']
	});
</script>

<Story name="Current Conditions">
	<div class="flex min-h-screen items-center justify-center bg-blue-900">
		<AppContainer scanlinesEnabled={true}>
			<AppHeader pageTitle="CURRENT CONDITIONS" />

			<WeatherPanelContainer>
				<WeatherPanel>
					<div class="flex h-full flex-col justify-between space-y-6 p-6">
						<!-- Station Info -->
						<div class="text-center">
							<p class="text-sm text-blue-300">Observation Station</p>
							<p class="text-lg text-white">Plymouth, Plymouth Municipal Airport</p>
						</div>

						<!-- Main Temperature Display -->
						<div class="text-center">
							<div class="text-8xl font-bold text-yellow-300">79°</div>
							<p class="mt-2 text-2xl text-white">Clear</p>
						</div>

						<!-- Weather Details Grid -->
						<div class="grid grid-cols-2 gap-4 text-white">
							<!-- Humidity -->
							<div class="rounded bg-blue-800/50 p-4">
								<p class="text-sm text-blue-300">Humidity</p>
								<p class="text-2xl font-bold">54%</p>
							</div>

							<!-- Dewpoint -->
							<div class="rounded bg-blue-800/50 p-4">
								<p class="text-sm text-blue-300">Dewpoint</p>
								<p class="text-2xl font-bold">61°F</p>
							</div>

							<!-- Wind -->
							<div class="rounded bg-blue-800/50 p-4">
								<p class="text-sm text-blue-300">Wind</p>
								<p class="text-2xl font-bold">SSW 8 mph</p>
							</div>

							<!-- Visibility -->
							<div class="rounded bg-blue-800/50 p-4">
								<p class="text-sm text-blue-300">Visibility</p>
								<p class="text-2xl font-bold">10 mi</p>
							</div>
						</div>

						<!-- Navigation hint -->
						<div class="text-center text-sm text-blue-300">
							<a href="/" class="underline hover:text-yellow-300">← Back to Home</a>
						</div>
					</div>
				</WeatherPanel>
			</WeatherPanelContainer>

			<Ticker>Weather for 41.9705,-70.7014 • Grid: BOX (87, 75)</Ticker>
		</AppContainer>
	</div>
</Story>

<Story name="Weather Menu">
	<div class="flex min-h-screen items-center justify-center bg-blue-900 p-4">
		<AppContainer scanlinesEnabled={true}>
			<AppHeader pageTitle="WEATHER MENU" />

			<WeatherPanelContainer>
				<WeatherPanel>
					<div class="flex h-full flex-col items-center justify-center space-y-8 p-8 text-center">
						<p class="text-2xl text-blue-200">Select a weather view:</p>

						<div class="grid w-full max-w-2xl gap-6">
							<div
								class="rounded-lg bg-blue-700/60 p-6 transition-all hover:scale-105 hover:bg-blue-600/80"
							>
								<h3 class="mb-2 text-2xl font-bold text-yellow-300">CURRENT CONDITIONS</h3>
								<p class="text-blue-100">Latest weather observations</p>
							</div>

							<div class="cursor-not-allowed rounded-lg bg-gray-700/40 p-6 opacity-50">
								<h3 class="mb-2 text-2xl font-bold text-gray-400">LOCAL FORECAST</h3>
								<p class="text-gray-300">Coming soon</p>
							</div>

							<div class="cursor-not-allowed rounded-lg bg-gray-700/40 p-6 opacity-50">
								<h3 class="mb-2 text-2xl font-bold text-gray-400">WEATHER HAZARDS</h3>
								<p class="text-gray-300">Coming soon</p>
							</div>
						</div>

						<div class="text-sm text-blue-300">
							<a href="/" class="underline hover:text-yellow-300">← Back to Home</a>
						</div>
					</div>
				</WeatherPanel>
			</WeatherPanelContainer>

			<Ticker>Weather for 41.9705,-70.7014 • Grid: BOX (87, 75)</Ticker>
		</AppContainer>
	</div>
</Story>

<Story name="Error State">
	<div class="flex min-h-screen items-center justify-center bg-blue-900 p-4">
		<AppContainer scanlinesEnabled={true}>
			<AppHeader pageTitle="CURRENT CONDITIONS" />

			<WeatherPanelContainer>
				<WeatherPanel>
					<div class="flex h-full flex-col items-center justify-center space-y-4 text-center">
						<div class="rounded border border-red-400 bg-red-900/30 p-6 text-lg text-red-300">
							<p class="mb-2 text-xl font-bold">⚠ Error</p>
							<p>Failed to load current weather conditions</p>
						</div>
						<button
							class="rounded bg-yellow-300 px-6 py-3 text-xl font-bold text-blue-900 transition-colors hover:bg-yellow-400"
						>
							RETRY
						</button>
					</div>
				</WeatherPanel>
			</WeatherPanelContainer>

			<Ticker>Weather Information</Ticker>
		</AppContainer>
	</div>
</Story>

<Story name="Loading State">
	<div class="flex min-h-screen items-center justify-center bg-blue-900 p-4">
		<AppContainer scanlinesEnabled={true}>
			<AppHeader pageTitle="Weather" />

			<WeatherPanelContainer>
				<WeatherPanel>
					<div class="flex h-full flex-col items-center justify-center">
						<p class="text-2xl text-yellow-300">Loading...</p>
					</div>
				</WeatherPanel>
			</WeatherPanelContainer>

			<Ticker>Weather Information</Ticker>
		</AppContainer>
	</div>
</Story>
