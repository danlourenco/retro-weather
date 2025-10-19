<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	const forecasts = data.data?.forecasts || [];

	let index = $state(0);
	let currentForecast = $state(forecasts[0]);

	onMount(() => {
		// Only start rotation if we have forecast data
		if (!data.data || forecasts.length === 0) return;

		// Set initial forecast
		currentForecast = forecasts[0];

		const interval = setInterval(() => {
			if (index < forecasts.length - 1) {
				index++;
			} else {
				index = 0;
			}
			currentForecast = forecasts[index];
		}, 5000);

		return () => clearInterval(interval);
	});

	// Log data to browser console
	if (data.data?.forecasts) {
		console.log('📅 Forecast Data:', JSON.stringify(data.data.forecasts, null, 2));
	}
</script>

<svelte:head>
	<title>Local Forecast - Retro Weather Channel</title>
</svelte:head>

{#if forecasts.length > 0 && currentForecast}
	<div class="flex flex-col items-center space-y-6">
		<!-- Forecast period indicator -->
		<!-- <div class="font-star text-xl text-yellow-300">
			Period {index + 1} of {forecasts.length}
		</div> -->

		<p class="text-shadow font-[Star4000] text-3xl uppercase md:text-4xl lg:text-5xl lg:leading-14">
			{`${currentForecast.dayName}... ${currentForecast.detailedForecast ?? currentForecast.shortForecast ?? 'No forecast available'}`}
		</p>
		<!-- Progress indicator dots -->
		<!-- <div class="flex gap-2">
			{#each forecasts as _, i}
				<div
					class="h-3 w-3 rounded-full transition-colors {i === index
						? 'bg-yellow-300'
						: 'bg-blue-700'}"
				></div>
			{/each}
		</div> -->
	</div>
{:else if data.error}
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
{:else}
	<div class="flex h-full flex-col items-center justify-center space-y-4 text-center">
		<p class="text-2xl text-yellow-300">NO FORECAST DATA AVAILABLE</p>
		<p class="text-blue-300">Forecast information is currently unavailable</p>
	</div>
{/if}
