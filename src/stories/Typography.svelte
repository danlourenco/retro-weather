<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		fontFamily?: string;
		showAllFonts?: boolean;
		sampleText?: string;
		textColor?: 'yellow' | 'white';
		background?: 'blue' | 'white';
		showTextShadow?: boolean;
	}

	let {
		fontFamily = 'Star4000',
		showAllFonts = false,
		sampleText = 'The quick brown fox jumps over the lazy dog',
		textColor = 'yellow',
		background = 'blue',
		showTextShadow = true
	}: Props = $props();

	const fonts = [
		{ name: 'Star4000', className: 'font-[Star4000]' },
		{ name: 'Star4000Small', className: 'font-[Star4000Small]' },
		{ name: 'Star4000Large', className: 'font-[Star4000Large]' },
		{ name: 'Star4000Extended', className: 'font-[Star4000Extended]' }
	];

	const selectedFont = $derived(fonts.find((f) => f.name === fontFamily) || fonts[0]);

	const bgClass = $derived(background === 'blue' ? 'bg-[#21285a]' : 'bg-white');
	const textColorClass = $derived(textColor === 'yellow' ? 'text-yellow-300' : 'text-white');
	const shadowClass = $derived(showTextShadow ? 'text-shadow' : '');
	const shadowSmClass = $derived(showTextShadow ? 'text-shadow-sm' : '');
	const headingColorClass = $derived(background === 'blue' ? 'text-white' : 'text-gray-900');
	const labelColorClass = $derived(background === 'blue' ? 'text-gray-300' : 'text-gray-600');
</script>

{#if showAllFonts}
	<div class={`space-y-8 p-8 ${bgClass}`}>
		<h1 class={`mb-6 font-sans text-3xl font-bold ${headingColorClass}`}>Typography Showcase</h1>

		{#each fonts as font}
			<div class={`${bgClass === 'bg-white' ? 'bg-gray-50' : 'bg-[#2a3266]'} rounded-lg p-6`}>
				<h2 class={`mb-4 font-sans text-xl font-bold ${headingColorClass}`}>{font.name}</h2>

				<!-- Sample Text -->
				<div class="mb-6">
					<h3 class={`mb-2 font-sans text-sm ${labelColorClass}`}>Sample Text</h3>
					<p class={`${font.className} ${textColorClass} ${shadowClass} text-2xl`}>{sampleText}</p>
				</div>

				<!-- Alphabet -->
				<div class="mb-6">
					<h3 class={`mb-2 font-sans text-sm ${labelColorClass}`}>Alphabet</h3>
					<p class={`${font.className} ${textColorClass} ${shadowClass} text-lg`}>
						ABCDEFGHIJKLMNOPQRSTUVWXYZ
					</p>
					<p class={`${font.className} ${textColorClass} ${shadowClass} text-lg`}>
						abcdefghijklmnopqrstuvwxyz
					</p>
				</div>

				<!-- Numbers & Symbols -->
				<div class="mb-6">
					<h3 class={`mb-2 font-sans text-sm ${labelColorClass}`}>Numbers & Symbols</h3>
					<p class={`${font.className} ${textColorClass} ${shadowClass} text-lg`}>0123456789</p>
					<p class={`${font.className} ${textColorClass} ${shadowClass} text-lg`}>
						{'!@#$%^&*()_+-=[]{}|;\'":<>?/'}
					</p>
				</div>

				<!-- Size Scale -->
				<div class="mb-6">
					<h3 class={`mb-2 font-sans text-sm ${labelColorClass}`}>Size Scale</h3>
					<div class="space-y-2">
						<p class={`${font.className} ${textColorClass} ${shadowSmClass} text-xs`}>
							Extra Small - {sampleText}
						</p>
						<p class={`${font.className} ${textColorClass} ${shadowSmClass} text-sm`}>
							Small - {sampleText}
						</p>
						<p class={`${font.className} ${textColorClass} ${shadowClass} text-base`}>
							Base - {sampleText}
						</p>
						<p class={`${font.className} ${textColorClass} ${shadowClass} text-lg`}>
							Large - {sampleText}
						</p>
						<p class={`${font.className} ${textColorClass} ${shadowClass} text-xl`}>
							Extra Large - {sampleText}
						</p>
						<p class={`${font.className} ${textColorClass} ${shadowClass} text-2xl`}>
							2XL - {sampleText}
						</p>
						<p class={`${font.className} ${textColorClass} ${shadowClass} text-3xl`}>
							3XL - {sampleText}
						</p>
					</div>
				</div>

				<!-- Color Variations (only on blue background) -->
				{#if background === 'blue'}
					<div>
						<h3 class={`mb-2 font-sans text-sm ${labelColorClass}`}>Color Variations</h3>
						<div class="space-y-2">
							<p class={`${font.className} text-yellow-300 ${shadowClass} text-xl`}>
								Yellow - {sampleText}
							</p>
							<p class={`${font.className} text-white ${shadowClass} text-xl`}>
								White - {sampleText}
							</p>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<div class={`p-8 ${bgClass}`}>
		<div class={`${bgClass === 'bg-white' ? 'bg-gray-50' : 'bg-[#2a3266]'} rounded-lg p-6`}>
			<h2 class={`mb-4 font-sans text-xl font-bold ${headingColorClass}`}>{selectedFont.name}</h2>
			<p class={`${selectedFont.className} ${textColorClass} ${shadowClass} text-2xl`}>
				{sampleText}
			</p>
		</div>
	</div>
{/if}
