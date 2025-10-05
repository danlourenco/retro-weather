<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const coords = data.data?.coords || '';
</script>

<svelte:head>
	<title>Weather Menu - Retro Weather Channel</title>
</svelte:head>

<div class="flex h-full flex-col items-center justify-center space-y-8 p-8 text-center">
	<p class="text-2xl text-blue-200">Select a weather view:</p>

	<div class="grid w-full max-w-2xl gap-6">
		<a
			href="/weather/{coords}/current-conditions"
			class="rounded-lg bg-blue-700/60 p-6 transition-all hover:bg-blue-600/80 hover:scale-105"
		>
			<h3 class="mb-2 text-2xl font-bold text-yellow-300">CURRENT CONDITIONS</h3>
			<p class="text-blue-100">Latest weather observations</p>
		</a>

		<button
			disabled
			class="rounded-lg bg-gray-700/40 p-6 opacity-50 cursor-not-allowed"
		>
			<h3 class="mb-2 text-2xl font-bold text-gray-400">LOCAL FORECAST</h3>
			<p class="text-gray-300">Coming soon</p>
		</button>

		<button
			disabled
			class="rounded-lg bg-gray-700/40 p-6 opacity-50 cursor-not-allowed"
		>
			<h3 class="mb-2 text-2xl font-bold text-gray-400">WEATHER HAZARDS</h3>
			<p class="text-gray-300">Coming soon</p>
		</button>
	</div>

	<div class="text-sm text-blue-300">
		<a href="/" class="underline hover:text-yellow-300">← Back to Home</a>
	</div>
</div>
