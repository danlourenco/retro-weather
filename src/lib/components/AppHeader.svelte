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

<div class="bg-header w-full">
	<div class="relative mx-auto w-full max-w-[968px]">
		<header class="relative mt-8 h-18 w-full text-white">
			<!-- Clipped gradient background layer - positioned to break out to viewport edges -->
			<div class="header-gradient bg-twilight-gradient absolute" style="top: 0; bottom: 0; left: 50%; right: 0; width: 100vw; margin-left: -50vw;"></div>

			<!-- Content layer -->
			<div class="relative z-10 flex h-full w-full flex-row items-center justify-between gap-x-12 px-8 md:px-16">
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
</div>
