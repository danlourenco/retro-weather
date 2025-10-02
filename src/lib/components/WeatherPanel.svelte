<script lang="ts">
	let { children }: { children: any } = $props();
</script>

<div class="font-star wx-stage wx-smooth-frame h-full p-8 text-4xl text-white [--frame:82px]">
	<div class="p-4">{@render children()}</div>
</div>
