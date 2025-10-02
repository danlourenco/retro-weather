<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AppHeader from '$lib/components/AppHeader.svelte';
	const { Story } = defineMeta({
		title: 'Components/AppHeader',
		component: AppHeader,
		tags: ['autodocs']
	});
</script>

<Story name="Default" />
