<script lang="ts">
	import type { PageData } from './$types';
	import { celsiusToFahrenheit, directionToNSEW } from '$lib/index';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Type Safety Demo - Retro Weather</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-blue-900 to-blue-600 p-8">
	<div class="mx-auto max-w-6xl">
		<header class="mb-8 text-center">
			<h1 class="mb-2 text-4xl font-bold text-white">🌤️ Type Safety Demo</h1>
			<p class="text-lg text-blue-200">OpenAPI → Zod → TypeScript → Svelte</p>
			<p class="mt-2 text-sm text-blue-300">Demonstrating the full type-safe data pipeline</p>
		</header>

		{#if data.error}
			<div class="mb-8 rounded-lg border border-red-400 bg-red-500/20 p-6 text-white">
				<h2 class="mb-2 text-xl font-bold">❌ Error</h2>
				<p class="mb-2">{data.error.message}</p>
				<p class="text-sm text-red-200">Type: {data.error.type}</p>
				{#if data.error.retryable}
					<button
						class="mt-4 rounded bg-red-600 px-4 py-2 transition-colors hover:bg-red-700"
						onclick={() => window.location.reload()}
					>
						🔄 Retry
					</button>
				{/if}
			</div>
		{:else if data.data}
			<!-- Location Info -->
			<div class="mb-6 rounded-lg bg-white/10 p-6 backdrop-blur-sm">
				<h2 class="mb-4 text-2xl font-bold text-white">📍 Location Data</h2>
				<div class="grid grid-cols-1 gap-4 text-white md:grid-cols-2">
					<div>
						<p><strong>Coordinates:</strong> {data.data.coords}</p>
						<p><strong>Grid ID:</strong> {data.data.location.gridId}</p>
						<p>
							<strong>Grid Point:</strong> ({data.data.location.gridX}, {data.data.location.gridY})
						</p>
					</div>
					<div class="space-y-1 text-sm">
						<p><strong>✅ DTO → Domain Mapping:</strong></p>
						<p class="text-green-200">• NWSPointsResponse → LocationInfo</p>
						<p class="text-green-200">• Zod validation passed</p>
						<p class="text-green-200">• Type-safe properties available</p>
					</div>
				</div>
			</div>

			<!-- Stations -->
			<div class="mb-6 rounded-lg bg-white/10 p-6 backdrop-blur-sm">
				<h2 class="mb-4 text-2xl font-bold text-white">🏢 Weather Stations</h2>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each data.data.stations as station}
						<div class="rounded bg-blue-500/20 p-3 text-white">
							<p class="font-semibold">{station.id}</p>
							<p class="text-sm text-blue-200">{station.name}</p>
						</div>
					{/each}
				</div>
				<div class="mt-4 text-sm text-blue-200">
					<p><strong>✅ Array Mapping:</strong> NWSStationsResponse → Station[]</p>
				</div>
			</div>

			<!-- Current Observation -->
			{#if data.data.observation}
				<div class="mb-6 rounded-lg bg-white/10 p-6 backdrop-blur-sm">
					<h2 class="mb-4 text-2xl font-bold text-white">🌡️ Current Conditions</h2>
					<div class="grid grid-cols-2 gap-4 text-white md:grid-cols-4">
						{#if data.data.observation.temperatureC !== undefined}
							<div class="text-center">
								<div class="text-3xl font-bold text-yellow-300">
									{Math.round(celsiusToFahrenheit(data.data.observation.temperatureC))}°F
								</div>
								<div class="text-sm text-blue-200">Temperature</div>
								<div class="text-xs text-green-200">
									({data.data.observation.temperatureC.toFixed(1)}°C)
								</div>
							</div>
						{/if}

						{#if data.data.observation.relativeHumidity !== undefined}
							<div class="text-center">
								<div class="text-2xl font-bold text-blue-300">
									{Math.round(data.data.observation.relativeHumidity)}%
								</div>
								<div class="text-sm text-blue-200">Humidity</div>
							</div>
						{/if}

						{#if data.data.observation.windSpeedKmh !== undefined && data.data.observation.windDirectionDeg !== undefined}
							<div class="text-center">
								<div class="text-2xl font-bold text-gray-300">
									{Math.round(data.data.observation.windSpeedKmh * 0.621371)} mph
								</div>
								<div class="text-sm text-blue-200">
									{directionToNSEW(data.data.observation.windDirectionDeg)} Wind
								</div>
							</div>
						{/if}

						{#if data.data.observation.textDescription}
							<div class="text-center">
								<div class="text-lg font-semibold text-white">
									{data.data.observation.textDescription}
								</div>
								<div class="text-sm text-blue-200">Conditions</div>
							</div>
						{/if}
					</div>

					<div class="mt-4 text-sm text-blue-200">
						<p><strong>✅ Complex Mapping:</strong> NWSObservationResponse → Observation</p>
						<p class="text-green-200">• Nested properties extracted safely</p>
						<p class="text-green-200">• Unit conversions applied</p>
						<p class="text-green-200">• Null values handled gracefully</p>
					</div>
				</div>
			{:else}
				<div class="mb-6 rounded-lg border border-yellow-400 bg-yellow-500/20 p-4 text-white">
					<p>⚠️ No current observation data available (station may be offline)</p>
				</div>
			{/if}

			<!-- Forecast -->
			<div class="mb-6 rounded-lg bg-white/10 p-6 backdrop-blur-sm">
				<h2 class="mb-4 text-2xl font-bold text-white">📅 Forecast Preview</h2>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					{#each data.data.forecast as period}
						<div class="rounded-lg bg-gradient-to-b from-blue-500/30 to-blue-600/30 p-4 text-white">
							<h3 class="mb-2 text-lg font-bold">{period.dayName}</h3>
							<div
								class="mb-2 text-2xl font-bold {period.isDaytime
									? 'text-yellow-300'
									: 'text-blue-300'}"
							>
								{period.temperature}°F
							</div>
							<p class="mb-2 text-sm text-blue-100">{period.shortForecast}</p>
							<div class="text-xs text-blue-200">
								{period.isDaytime ? '☀️ Day' : '🌙 Night'}
							</div>
						</div>
					{/each}
				</div>

				<div class="mt-4 text-sm text-blue-200">
					<p><strong>✅ Array Processing:</strong> NWSForecastResponse → ForecastDay[]</p>
					<p class="text-green-200">• Period data normalized</p>
					<p class="text-green-200">• Day/night periods handled</p>
				</div>
			</div>

			<!-- Type Safety Demo -->
			<div class="rounded-lg border border-green-400 bg-green-500/20 p-6">
				<h2 class="mb-4 text-2xl font-bold text-white">✅ Type Safety Verification</h2>
				<div class="grid grid-cols-1 gap-6 text-white md:grid-cols-2">
					<div>
						<h3 class="mb-2 font-semibold text-green-300">🛡️ Runtime Validation</h3>
						<ul class="space-y-1 text-sm text-green-100">
							<li>• Zod schemas validate API responses</li>
							<li>• Invalid data caught before reaching UI</li>
							<li>• Detailed error information available</li>
							<li>• Graceful fallbacks for missing data</li>
						</ul>
					</div>
					<div>
						<h3 class="mb-2 font-semibold text-green-300">📋 Compile-time Safety</h3>
						<ul class="space-y-1 text-sm text-green-100">
							<li>• TypeScript ensures property access safety</li>
							<li>• IDE autocomplete for all domain properties</li>
							<li>• Refactoring support across entire codebase</li>
							<li>• No typos in property names possible</li>
						</ul>
					</div>
				</div>

				<div class="mt-4 rounded bg-black/20 p-4 font-mono text-sm text-green-200">
					<p>// All of this data is fully typed and validated:</p>
					<p>data.data.location.gridId: string</p>
					<p>data.data.observation?.temperatureC: number | undefined</p>
					<p>data.data.forecast: ForecastDay[]</p>
				</div>
			</div>
		{:else}
			<div class="text-center text-white">
				<div class="mb-4 animate-spin text-6xl">🌀</div>
				<p>Loading demo data...</p>
			</div>
		{/if}
	</div>
</div>
