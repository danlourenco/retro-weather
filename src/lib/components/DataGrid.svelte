<script lang="ts">
	import type { WeatherDataItem } from '$lib/types/domain';

	let { items }: { items: WeatherDataItem[] } = $props();
</script>

<dl class="font-star-large grid grid-cols-2 gap-x-2 gap-y-3 text-xl">
	{#each items as item}
		<dt class="after:content-[':']">{item.label}</dt>
		<dd class="text-right">
			{item.value}{item.unit || ''}
		</dd>
	{/each}
</dl>
