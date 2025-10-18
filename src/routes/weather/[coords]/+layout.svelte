<script lang="ts">
	import type { LayoutData } from './$types';
	import AppContainer from '$lib/components/AppContainer.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import WeatherPanelContainer from '$lib/components/WeatherPanelContainer.svelte';
	import WeatherPanel from '$lib/components/WeatherPanel.svelte';
	import Ticker from '$lib/components/Ticker.svelte';
	import { page } from '$app/state';
	import { onNavigate } from '$app/navigation';
	import { WeatherNavigation } from '$lib/services/navigation';

	let { data, children }: { data: LayoutData; children: any } = $props();

	// Enable View Transitions API for smooth page transitions
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	// Get page title from the current page's data (child page)
	// Fallback to a default title
	const pageTitle = $derived(page.data?.data?.pageTitle || 'Weather');

	// Determine current route and toggle function
	const isLocalForecast = $derived(page.url.pathname.includes('/local-forecast'));
	const isCurrentConditions = $derived(page.url.pathname.includes('/current-conditions'));

	const handleTitleClick = () => {
		const coords = data.data?.coords;
		if (!coords) return;

		// Toggle between the two routes
		if (isLocalForecast) {
			WeatherNavigation.goToCurrentConditions(coords);
		} else if (isCurrentConditions) {
			WeatherNavigation.goToLocalForecast(coords);
		}
	};

	// Build ticker messages - prioritize hazards if they exist
	const tickerMessages = $derived.by(() => {
		if (data.data?.hazards && data.data.hazards.length > 0) {
			return data.data.hazards.map((h) => h.headline);
		}

		if (data.data?.location) {
			return [
				`Weather for ${data.data.coords}`,
				`Grid: ${data.data.location.gridId} (${data.data.location.gridX}, ${data.data.location.gridY})`
			];
		}

		return ['Weather Information'];
	});

	// Determine ticker variant and mode based on hazards
	const tickerVariant = $derived(
		data.data?.hazards && data.data.hazards.length > 0 ? 'hazard' : 'default'
	);
	const tickerMode = $derived(
		data.data?.hazards && data.data.hazards.length > 0 ? 'scroll' : 'cycle'
	);
</script>

<div class="flex min-h-screen">
	<AppContainer scanlinesEnabled={true}>
		<AppHeader
			{pageTitle}
			onTitleClick={isLocalForecast || isCurrentConditions ? handleTitleClick : undefined}
		/>

		<WeatherPanelContainer>
			<WeatherPanel>
				{#if data.error}
					<div class="flex flex-col items-center justify-center space-y-4 text-center">
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

		<Ticker messages={tickerMessages} variant={tickerVariant} mode={tickerMode} scrollSpeed={3} />
	</AppContainer>
</div>
