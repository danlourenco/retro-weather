<script lang="ts">
	let { children }: { children: any } = $props();
</script>

<div class="bg-sunset-gradient flex min-h-[400px] w-full flex-1 justify-center">
	<div class="mx-auto w-full max-w-[968px] px-8 md:px-16">
		{@render children()}
	</div>
</div>
