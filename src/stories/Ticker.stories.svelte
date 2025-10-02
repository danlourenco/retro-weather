<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Ticker from '$lib/components/Ticker.svelte';

	const { Story } = defineMeta({
		title: 'Components/Ticker',
		component: Ticker,
		tags: ['autodocs']
	});
</script>

<Story name="Default">
	<p>Scrolling content will go here</p>
</Story>
