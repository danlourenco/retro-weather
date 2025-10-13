<script lang="ts">
	let { children }: { children: any } = $props();
</script>

<div class="bg-sunset-gradient flex w-full flex-1 justify-center">
	<div class="container mx-auto flex w-full flex-col">
		{@render children()}
	</div>
</div>
