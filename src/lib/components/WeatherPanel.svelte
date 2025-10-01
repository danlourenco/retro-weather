<script lang="ts">
	let { children }: { children: any } = $props();
</script>

<div class="font-star h-full bg-panel p-8 text-4xl text-white shadow-inset">
	{@render children()}
</div>
