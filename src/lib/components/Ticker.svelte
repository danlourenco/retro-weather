<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		variant?: 'default' | 'hazard';
		mode?: 'cycle' | 'scroll'; // separate behavior from styling
		messages: string[];
		cycleInterval?: number; // milliseconds between message changes (cycle mode)
		scrollSpeed?: number; // pixels per second (scroll mode)
	}

	let {
		variant = 'default',
		mode = 'cycle',
		messages,
		cycleInterval = 5000,
		scrollSpeed = 5
	}: Props = $props();

	let currentIndex = $state(0);
	let scrollPosition = $state(0);
	let intervalId: ReturnType<typeof setInterval> | null = null;
	let animationId: number | null = null;

	// Cycle mode: swap through messages
	function startCycling() {
		if (messages.length <= 1) return;

		intervalId = setInterval(() => {
			currentIndex = (currentIndex + 1) % messages.length;
		}, cycleInterval);
	}

	// Scroll mode: horizontal scrolling animation
	function startScrolling() {
		let lastTimestamp = 0;

		function animate(timestamp: number) {
			if (lastTimestamp === 0) {
				lastTimestamp = timestamp;
			}

			const deltaTime = (timestamp - lastTimestamp) / 1000; // convert to seconds
			scrollPosition -= scrollSpeed * deltaTime;

			// Reset when scrolled past (adjust based on content width)
			if (scrollPosition < -100) {
				scrollPosition = 100;
			}

			lastTimestamp = timestamp;
			animationId = requestAnimationFrame(animate);
		}

		animationId = requestAnimationFrame(animate);
	}

	onMount(() => {
		if (mode === 'cycle') {
			startCycling();
		} else {
			startScrolling();
		}
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
		if (animationId) cancelAnimationFrame(animationId);
	});

	const currentMessage = $derived(
		mode === 'cycle' ? messages[currentIndex] || '' : messages.join(' • ')
	);
	const bgClass = $derived(variant === 'hazard' ? 'bg-[var(--color-hazard-red)]' : 'bg-ticker');
</script>

<div
	class="text-shadow flex h-[80px] w-full flex-row justify-center border-t-2 border-t-gray-300 {bgClass} font-[Star4000] text-4xl text-white"
>
	{#if mode === 'cycle'}
		<div class="container mx-auto flex w-full flex-row items-center justify-start py-4">
			{currentMessage}
		</div>
	{:else}
		<div class="relative w-full overflow-hidden">
			<div
				class="absolute px-12 py-4 whitespace-nowrap"
				style="transform: translateX({scrollPosition}%); transition: transform 0.1s linear;"
			>
				{currentMessage}
			</div>
		</div>
	{/if}
</div>
