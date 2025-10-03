<script lang="ts">
	import type { PageData } from './$types';
	import { WeatherNavigation } from '$lib/services/navigation';

	let { data }: { data: PageData } = $props();

	const coords = data.data?.coords || '';
</script>

<div class="space-y-6">
	<div class="rounded-lg bg-white/10 p-6 text-white backdrop-blur-sm">
		<h2 class="mb-4 text-xl font-bold">Weather Overview</h2>
		<p class="mb-4">Select a weather view:</p>

		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<button
				class="rounded-lg bg-blue-500/80 p-4 transition-colors hover:bg-blue-600/80"
				onclick={() => WeatherNavigation.goToCurrentConditions(coords)}
			>
				<h3 class="font-semibold">Current Conditions</h3>
				<p class="text-sm text-blue-100">Latest observations</p>
			</button>

			<button
				class="rounded-lg bg-green-500/80 p-4 transition-colors hover:bg-green-600/80"
				onclick={() => WeatherNavigation.goToLocalForecast(coords)}
			>
				<h3 class="font-semibold">Local Forecast</h3>
				<p class="text-sm text-green-100">7-day outlook</p>
			</button>

			<button
				class="rounded-lg bg-orange-500/80 p-4 transition-colors hover:bg-orange-600/80"
				onclick={() => WeatherNavigation.goToHazards(coords)}
			>
				<h3 class="font-semibold">Weather Hazards</h3>
				<p class="text-sm text-orange-100">Alerts & warnings</p>
			</button>

			<button
				class="rounded-lg bg-purple-500/80 p-4 transition-colors hover:bg-purple-600/80"
				onclick={() => WeatherNavigation.goToExtendedForecast(coords)}
			>
				<h3 class="font-semibold">Extended Forecast</h3>
				<p class="text-sm text-purple-100">14-day outlook</p>
			</button>
		</div>
	</div>

	{#if data.data?.location}
		<div class="rounded-lg bg-white/10 p-6 text-white backdrop-blur-sm">
			<h3 class="mb-2 text-lg font-semibold">Location Information</h3>
			<div class="space-y-1 text-sm">
				<p><strong>Grid ID:</strong> {data.data.location.gridId}</p>
				<p><strong>Grid Point:</strong> ({data.data.location.gridX}, {data.data.location.gridY})</p>
				<p>
					<strong>Forecast URL:</strong>
					<a href={data.data.location.forecast} class="text-blue-300 underline hover:text-blue-200"
						>View</a
					>
				</p>
				<p>
					<strong>Stations URL:</strong>
					<a
						href={data.data.location.observationStations}
						class="text-blue-300 underline hover:text-blue-200">View</a
					>
				</p>
			</div>
		</div>
	{/if}
</div>
