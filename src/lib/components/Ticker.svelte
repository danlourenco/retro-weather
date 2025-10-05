<script lang="ts">
	let { children }: { children: any } = $props();
</script>

<div
	class="text-shadow sticky bottom-0 flex h-[80px] w-full flex-row justify-center border-t-2 border-t-gray-300 bg-ticker font-[Star4000] text-4xl text-white"
>
	<div class="mx-auto flex w-full max-w-[968px] flex-row items-center justify-start px-12 py-4">
		{@render children()}
	</div>
</div>
