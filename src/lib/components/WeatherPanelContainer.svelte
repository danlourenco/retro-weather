<script lang="ts">
	let { children }: { children: any } = $props();
</script>

<div class="bg-sunset-gradient flex w-full flex-1 justify-center">
	<div class="mx-auto flex w-full flex-col px-8 md:px-16">
		{@render children()}
	</div>
</div>
