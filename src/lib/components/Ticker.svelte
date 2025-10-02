<script lang="ts">
	let { children }: { children: any } = $props();
</script>

<div
	class="text-shadow flex h-[80px] flex-row justify-start border-t-2 border-t-gray-300 bg-ticker px-12 py-4 align-middle font-[Star4000] text-4xl text-white"
>
	{@render children()}
</div>
