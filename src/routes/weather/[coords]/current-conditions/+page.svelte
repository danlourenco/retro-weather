<script lang="ts">
	import type { PageData } from './$types';
	import DataGrid from '$lib/components/DataGrid.svelte';
	import { transformCurrentConditions } from '$lib/utils/weather';

	let { data }: { data: PageData } = $props();

	const {
		temperature,
		textDescription,
		stationName,
		weatherImage,
		windDisplay,
		hasValidData,
		weatherDataItems
	} = transformCurrentConditions(data.data?.observation, data.data?.station);

	const station = data.data?.station;

	// Log data to browser console
	if (data.data?.observation) {
		console.log('🌡️ Raw Observation Data:', JSON.stringify(data.data.observation, null, 2));
	}
	if (data.data?.hazards) {
		console.log('📢 Weather Hazards/Alerts:', data.data.hazards);
	}
</script>

<svelte:head>
	<title>Current Conditions - Retro Weather Channel</title>
</svelte:head>

{#if hasValidData}
	<div class="flex flex-col items-center sm:flex-row md:justify-between">
		<div class="flex w-1/2 flex-col text-center">
			<div class="font-star-large text-3xl">
				{temperature !== null ? `${temperature}°F` : 'N/A'}
			</div>
			<div class="font-star-extended text-4xl">
				{textDescription}
			</div>
			<div class="justify-items-center">
				{#if weatherImage}
					<div class="mt-4">
						<img src={weatherImage} alt={textDescription} class="mx-auto h-32 w-auto" />
					</div>
				{/if}
				{#if windDisplay}
					<div class="font-star mt-2 text-4xl">Wind: {windDisplay}</div>
				{/if}
			</div>
		</div>
		<div class="hidden sm:block">
			<h2 class="font-star-large mb-2 text-2xl text-yellow-300 normal-case">
				{stationName}
			</h2>
			<DataGrid items={weatherDataItems} />
		</div>
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
		<p class="text-2xl text-yellow-300">NO DATA AVAILABLE</p>
		{#if station}
			<p class="text-lg text-blue-200">Station: {station.name}</p>
		{/if}
		<p class="text-blue-300">Weather observations are currently unavailable</p>
	</div>
{/if}
