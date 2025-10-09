<script lang="ts">
	let { children, scanlinesEnabled = false }: { children: any; scanlinesEnabled?: boolean } =
		$props();
</script>

<div class="flex w-full flex-col bg-blue-100" class:weatherstar-scanlines={scanlinesEnabled}>
	{@render children()}
</div>
