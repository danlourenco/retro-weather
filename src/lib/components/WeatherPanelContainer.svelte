<script lang="ts">
	let { children }: { children: any } = $props();
</script>

<div class="bg-sunset-gradient flex w-full flex-1 justify-center px-8 md:h-full md:max-w-full">
	<div class="container px-8">
		{@render children()}
	</div>
</div>
