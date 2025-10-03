<script lang="ts">
	import { onMount } from 'svelte';

	let { pageTitle = 'Title' } = $props<{ pageTitle?: string; children?: any }>();

	let currentTime = $state(
		new Date().toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		})
	);

	let currentDate = $state(
		new Date().toLocaleDateString([], {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		})
	);

	onMount(() => {
		const interval = setInterval(() => {
			currentTime = new Date().toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit'
			});
			currentDate = new Date().toLocaleDateString([], {
				weekday: 'short',
				month: 'short',
				day: 'numeric'
			});
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<div class="bg-header">
	<header class="relative mt-8 h-18 w-full text-white">
		<!-- Clipped gradient background layer -->
		<div class="clip-angled-right bg-twilight-gradient absolute inset-0"></div>

		<!-- Content layer -->
		<div
			class="relative z-10 container mx-auto flex h-full flex-row items-center justify-between gap-x-12 px-8"
		>
			<!-- Logo -->
			<div class="w-fit flex-shrink-0">
				<img src="/images/custom-logo.svg" alt="Weatherstar" />
			</div>

			<!-- Page Title -->
			<div class="text-shadow font-[Star4000] text-3xl text-[#ff0] sm:text-4xl">
				{pageTitle}
			</div>

			<!-- NOAA Logo -->
			<img src="/images/noaa.gif" class="hidden w-fit flex-shrink-0 md:block" alt="NOAA" />

			<!-- Date/Time -->
			<div
				class="text-shadow ml-auto flex flex-shrink-0 flex-col items-end font-[Star4000Small] text-2xl text-white sm:text-2xl md:text-3xl"
			>
				<div class="leading-none">{currentTime}</div>
				<div class="-mt-1 text-xl sm:text-2xl md:text-3xl">{currentDate.toUpperCase()}</div>
			</div>
		</div>
	</header>
</div>
