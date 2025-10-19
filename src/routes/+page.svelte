<script lang="ts">
	import AppContainer from '$lib/components/AppContainer.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import WeatherPanelContainer from '$lib/components/WeatherPanelContainer.svelte';
	import WeatherPanel from '$lib/components/WeatherPanel.svelte';
	import { goto } from '$app/navigation';
	import {
		lookupZipcode,
		isValidZipcode,
		getCurrentPosition,
		getGeolocationErrorMessage
	} from '$lib/utils/geolocation';

	let { data } = $props();

	let zipcode = $state('');
	let isLoading = $state(false);
	let errorMessage = $state('');
	let locationStatus = $state('');

	async function handleZipcodeLookup() {
		if (!zipcode.trim()) {
			errorMessage = 'Please enter a zipcode';
			return;
		}

		if (!isValidZipcode(zipcode)) {
			errorMessage = 'Please enter a valid 5-digit zipcode';
			return;
		}

		isLoading = true;
		errorMessage = '';
		locationStatus = 'Looking up location...';

		try {
			const coords = await lookupZipcode(zipcode);
			if (coords) {
				const locationName =
					coords.city && coords.state ? `${coords.city}, ${coords.state}` : 'your location';
				locationStatus = `Found ${locationName}! Redirecting...`;
				await goto(`/weather/${coords.lat},${coords.lon}/current-conditions`);
			} else {
				errorMessage = 'Zipcode not found. Please verify the zipcode is valid and try again.';
			}
		} catch (error) {
			errorMessage = 'Failed to lookup location. Please try again.';
		} finally {
			isLoading = false;
			locationStatus = '';
		}
	}

	async function handleGeolocation() {
		isLoading = true;
		errorMessage = '';
		locationStatus = 'Getting your location...';

		try {
			const position = await getCurrentPosition();
			const { latitude, longitude } = position.coords;
			locationStatus = 'Location detected! Redirecting...';

			// Small delay to show the status message
			setTimeout(async () => {
				await goto(`/weather/${latitude.toFixed(4)},${longitude.toFixed(4)}/current-conditions`);
			}, 1000);
		} catch (error) {
			isLoading = false;
			locationStatus = '';

			if (error instanceof GeolocationPositionError) {
				errorMessage = getGeolocationErrorMessage(error);
			} else if (error instanceof Error) {
				errorMessage = error.message;
			} else {
				errorMessage = 'Failed to get your location. Please enter your zipcode manually.';
			}
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleZipcodeLookup();
		}
	}
</script>

<svelte:head>
	<title>Retro Weather Channel</title>
</svelte:head>

<div class="flex h-screen max-h-screen flex-col items-center justify-center bg-header">
	<AppHeader pageTitle="WELCOME" />

	<WeatherPanelContainer>
		<WeatherPanel>
			<div class="flex h-full flex-col items-center justify-center space-y-8 text-center">
				<!-- Welcome Header -->
				<div class="space-y-4">
					<p class="text-xl text-blue-200">Your Local Weather Information</p>
					<p class="text-sm text-blue-300">v{data.version}</p>
				</div>

				<!-- Location Input Section -->
				<div class="w-full max-w-md space-y-6">
					<div class="space-y-4">
						<h3 class="text-2xl text-yellow-300">GET YOUR FORECAST</h3>

						<!-- Zipcode Input -->
						<div class="space-y-3">
							<input
								bind:value={zipcode}
								onkeypress={handleKeyPress}
								placeholder="Enter Zipcode"
								maxlength="5"
								pattern="[0-9]{5}"
								class="w-full rounded border-2 border-yellow-300 bg-blue-800 px-4 py-3 text-xl text-white placeholder-blue-300 focus:border-yellow-400 focus:outline-none"
								disabled={isLoading}
							/>

							<button
								onclick={handleZipcodeLookup}
								disabled={isLoading || !zipcode.trim()}
								class="w-full rounded bg-yellow-300 px-6 py-3 text-xl font-bold text-blue-900 transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{isLoading ? 'SEARCHING...' : 'GET WEATHER'}
							</button>
						</div>
						<!-- Divider -->
						<div class="flex items-center space-x-4">
							<div class="h-px flex-1 bg-blue-300"></div>
							<span class="text-lg text-blue-300">OR</span>
							<div class="h-px flex-1 bg-blue-300"></div>
						</div>

						<!-- Geolocation Button -->
						<button
							onclick={handleGeolocation}
							disabled={isLoading}
							class="w-full rounded bg-slate-600 px-6 py-3 text-xl font-bold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							📍 USE MY LOCATION
						</button>
					</div>

					<!-- Status Messages -->
					{#if locationStatus}
						<div class="animate-pulse text-lg text-green-300">
							{locationStatus}
						</div>
					{/if}

					{#if errorMessage}
						<div class="rounded border border-red-400 bg-red-900/30 p-3 text-lg text-red-300">
							{errorMessage}
						</div>
					{/if}
				</div>

				<!-- Demo Link -->
				<!-- <div class="text-sm text-blue-300">
						<a href="/demo" class="underline hover:text-yellow-300"> 🔧 View Technical Demo </a>
					</div> -->
			</div>
		</WeatherPanel>
	</WeatherPanelContainer>
</div>
