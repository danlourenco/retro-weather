<script lang="ts">
	let { children, scanlinesEnabled = false }: { children: any; scanlinesEnabled?: boolean } =
		$props();
</script>

<div
	class=" flex aspect-[4/3] max-w-[968px] flex-col bg-blue-100"
	class:weatherstar-scanlines={scanlinesEnabled}
>
	{@render children()}
</div>
