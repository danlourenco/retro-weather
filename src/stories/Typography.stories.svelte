<script context="module">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Typography from './Typography.svelte';

	const { Story } = defineMeta({
		title: 'Design System/Typography',
		component: Typography,
		tags: ['autodocs'],
		argTypes: {
			fontFamily: {
				control: 'select',
				options: ['Star4000', 'Star4000Small', 'Star4000Large', 'Star4000Extended'],
				description: 'Font family to display'
			},
			showAllFonts: {
				control: 'boolean',
				description: 'Show all fonts at once'
			},
			sampleText: {
				control: 'text',
				description: 'Sample text to display'
			},
			textColor: {
				control: 'select',
				options: ['yellow', 'white'],
				description: 'Text color'
			},
			background: {
				control: 'select',
				options: ['blue', 'white'],
				description: 'Background color'
			},
			showTextShadow: {
				control: 'boolean',
				description: 'Show text shadow'
			}
		}
	});
</script>

<Story
	name="All Fonts - Blue Background"
	args={{
		showAllFonts: true,
		sampleText: 'The quick brown fox jumps over the lazy dog',
		textColor: 'yellow',
		background: 'blue',
		showTextShadow: true
	}}
/>

<Story
	name="All Fonts - Yellow on Blue"
	args={{
		showAllFonts: true,
		sampleText: 'The quick brown fox jumps over the lazy dog',
		textColor: 'yellow',
		background: 'blue',
		showTextShadow: true
	}}
/>

<Story
	name="All Fonts - White on Blue"
	args={{
		showAllFonts: true,
		sampleText: 'The quick brown fox jumps over the lazy dog',
		textColor: 'white',
		background: 'blue',
		showTextShadow: true
	}}
/>

<Story
	name="Star4000 - Yellow"
	args={{
		fontFamily: 'Star4000',
		showAllFonts: false,
		sampleText: 'The quick brown fox jumps over the lazy dog',
		textColor: 'yellow',
		background: 'blue',
		showTextShadow: true
	}}
/>

<Story
	name="Star4000Large - White"
	args={{
		fontFamily: 'Star4000Large',
		showAllFonts: false,
		sampleText: 'The quick brown fox jumps over the lazy dog',
		textColor: 'white',
		background: 'blue',
		showTextShadow: true
	}}
/>

<Story
	name="Weather Display - Yellow"
	args={{
		fontFamily: 'Star4000Large',
		showAllFonts: false,
		sampleText: '72°F Partly Cloudy',
		textColor: 'yellow',
		background: 'blue',
		showTextShadow: true
	}}
/>

<Story
	name="Weather Display - White"
	args={{
		fontFamily: 'Star4000Large',
		showAllFonts: false,
		sampleText: '72°F Partly Cloudy',
		textColor: 'white',
		background: 'blue',
		showTextShadow: true
	}}
/>

<Story
	name="No Shadow Comparison"
	args={{
		fontFamily: 'Star4000Large',
		showAllFonts: false,
		sampleText: 'Compare with and without shadow',
		textColor: 'yellow',
		background: 'blue',
		showTextShadow: false
	}}
/>
