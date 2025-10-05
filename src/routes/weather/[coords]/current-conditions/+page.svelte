<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const station = data.data?.station;
	const observation = data.data?.observation;

	function celsiusToFahrenheit(celsius: number | undefined): number | null {
		if (celsius === undefined) return null;
		return Math.round((celsius * 9) / 5 + 32);
	}

	function metersToMiles(meters: number | undefined): number | null {
		if (meters === undefined) return null;
		return Math.round((meters / 1609.34) * 10) / 10;
	}

	function kmhToMph(kmh: number | undefined): number | null {
		if (kmh === undefined) return null;
		return Math.round(kmh * 0.621371);
	}

	function getWindDirection(degrees: number | undefined): string {
		if (degrees === undefined) return 'N/A';
		const directions = [
			'N',
			'NNE',
			'NE',
			'ENE',
			'E',
			'ESE',
			'SE',
			'SSE',
			'S',
			'SSW',
			'SW',
			'WSW',
			'W',
			'WNW',
			'NW',
			'NNW'
		];
		const index = Math.round(degrees / 22.5) % 16;
		return directions[index];
	}
</script>

<svelte:head>
	<title>Current Conditions - Retro Weather Channel</title>
</svelte:head>

{#if data.error}
	<div class="flex h-full flex-col items-center justify-center space-y-4 text-center">
		<div class="rounded border border-red-400 bg-red-900/30 p-6 text-lg text-red-300">
			<p class="mb-2 text-xl font-bold">⚠ Error</p>
			<p>{data.error.message}</p>
		</div>
		{#if data.error.retryable}
			<button
				onclick={() => window.location.reload()}
				class="rounded bg-yellow-300 px-6 py-3 text-xl font-bold text-blue-900 transition-colors hover:bg-yellow-400"
			>
				RETRY
			</button>
		{/if}
	</div>
{:else if !observation}
	<div class="flex h-full flex-col items-center justify-center space-y-4 text-center">
		<p class="text-2xl text-yellow-300">NO DATA AVAILABLE</p>
		{#if station}
			<p class="text-lg text-blue-200">Station: {station.name}</p>
		{/if}
		<p class="text-blue-300">Weather observations are currently unavailable</p>
	</div>
{:else}
	<div class="flex h-full flex-col justify-between space-y-6 p-6">
					<!-- Station Info -->
					{#if station}
						<div class="text-center">
							<p class="text-sm text-blue-300">Observation Station</p>
							<p class="text-lg text-white">{station.name}</p>
						</div>
					{/if}

					<!-- Main Temperature Display -->
					<div class="text-center">
						{#if observation.temperatureC !== undefined}
							<div class="text-8xl font-bold text-yellow-300">
								{celsiusToFahrenheit(observation.temperatureC)}°
							</div>
							<p class="mt-2 text-2xl text-white">
								{observation.textDescription || 'N/A'}
							</p>
						{:else}
							<div class="text-4xl text-yellow-300">Temperature N/A</div>
						{/if}
					</div>

					<!-- Weather Details Grid -->
					<div class="grid grid-cols-2 gap-4 text-white">
						<!-- Humidity -->
						<div class="rounded bg-blue-800/50 p-4">
							<p class="text-sm text-blue-300">Humidity</p>
							<p class="text-2xl font-bold">
								{observation.relativeHumidity !== undefined
									? `${Math.round(observation.relativeHumidity)}%`
									: 'N/A'}
							</p>
						</div>

						<!-- Dewpoint -->
						<div class="rounded bg-blue-800/50 p-4">
							<p class="text-sm text-blue-300">Dewpoint</p>
							<p class="text-2xl font-bold">
								{observation.dewpointC !== undefined
									? `${celsiusToFahrenheit(observation.dewpointC)}°F`
									: 'N/A'}
							</p>
						</div>

						<!-- Wind -->
						<div class="rounded bg-blue-800/50 p-4">
							<p class="text-sm text-blue-300">Wind</p>
							<p class="text-2xl font-bold">
								{observation.windSpeedKmh !== undefined
									? `${getWindDirection(observation.windDirectionDeg)} ${kmhToMph(observation.windSpeedKmh)} mph`
									: 'N/A'}
							</p>
						</div>

						<!-- Visibility -->
						<div class="rounded bg-blue-800/50 p-4">
							<p class="text-sm text-blue-300">Visibility</p>
							<p class="text-2xl font-bold">
								{observation.visibilityM !== undefined
									? `${metersToMiles(observation.visibilityM)} mi`
									: 'N/A'}
							</p>
						</div>

						<!-- Wind Chill -->
						{#if observation.windChillC !== undefined}
							<div class="col-span-2 rounded bg-blue-800/50 p-4">
								<p class="text-sm text-blue-300">Wind Chill</p>
								<p class="text-2xl font-bold">
									{celsiusToFahrenheit(observation.windChillC)}°F
								</p>
							</div>
						{/if}
					</div>

		<!-- Navigation hint -->
		<div class="text-center text-sm text-blue-300">
			<a href="/" class="underline hover:text-yellow-300">← Back to Home</a>
		</div>
	</div>
{/if}
