<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- Preload critical fonts to prevent FOUT -->
	<link rel="preload" href="/fonts/Star4000.woff" as="font" type="font/woff" crossorigin />
	<link rel="preload" href="/fonts/Star4000Small.woff" as="font" type="font/woff" crossorigin />
	<link rel="preload" href="/fonts/Star4000Large.woff" as="font" type="font/woff" crossorigin />
	<link rel="preload" href="/fonts/Star4000Extended.woff" as="font" type="font/woff" crossorigin />
</svelte:head>

{@render children?.()}
