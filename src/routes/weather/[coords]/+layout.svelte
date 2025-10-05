<script lang="ts">
	import type { LayoutData } from './$types';
	import type { Snapshot } from './$types';
	import AppContainer from '$lib/components/AppContainer.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import WeatherPanelContainer from '$lib/components/WeatherPanelContainer.svelte';
	import WeatherPanel from '$lib/components/WeatherPanel.svelte';
	import Ticker from '$lib/components/Ticker.svelte';

	let { data, children }: { data: LayoutData & { pageTitle?: string }; children: any } = $props();

	// Get page title from data (will be set by individual pages)
	// Fallback to a default title
	const pageTitle = $derived(data.data?.pageTitle || 'Weather');
</script>

<div class="flex min-h-screen items-center justify-center bg-blue-900">
	<AppContainer scanlinesEnabled={true}>
		<AppHeader {pageTitle} />

		<WeatherPanelContainer>
			<WeatherPanel>
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
				{:else if data.data}
					{@render children()}
				{:else}
					<div class="flex h-full flex-col items-center justify-center">
						<p class="text-2xl text-yellow-300">Loading...</p>
					</div>
				{/if}
			</WeatherPanel>
		</WeatherPanelContainer>

		<Ticker>
			{#if data.data?.location}
				Weather for {data.data.coords} • Grid: {data.data.location.gridId} ({data.data.location
					.gridX}, {data.data.location.gridY})
			{:else}
				Weather Information
			{/if}
		</Ticker>
	</AppContainer>
</div>
