<script lang="ts">
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();
</script>

<div class="weather-layout min-h-screen bg-gradient-to-b from-blue-900 to-blue-600">
	<div class="container mx-auto px-4 py-8">
		{#if data.data}
			<div class="mb-4 text-white">
				<h1 class="text-2xl font-bold">Weather for {data.data.coords}</h1>
				<p class="text-blue-200">
					Grid: {data.data.location.gridId} ({data.data.location.gridX}, {data.data.location.gridY})
				</p>
			</div>

			{@render children()}
		{:else if data.error}
			<div class="text-center text-white">
				<h2 class="mb-2 text-xl font-bold">Error Loading Weather Data</h2>
				<p class="text-red-200">{data.error.message}</p>
				{#if data.error.retryable}
					<button
						class="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
						onclick={() => window.location.reload()}
					>
						Retry
					</button>
				{/if}
			</div>
		{/if}
	</div>
</div>
