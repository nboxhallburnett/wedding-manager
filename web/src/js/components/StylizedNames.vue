<script setup>
const bride = CONFIG.bride_short;
const groom = CONFIG.groom_short;
</script>

<template>
	<div id="stylized-names-container" class="text-center d-inline-flex h1 mb-3 w-100">
		<h1 id="stylized-names" class="w-100">
			{{ bride }}
			<div id="stylized-ampersand" class="font-script px-1">
				&
			</div>
			{{ groom }}
		</h1>
	</div>
</template>

<style lang="scss">
#stylized-names {
	--stylized-text-base: 3.5rem;
	--stylized-ampersand-color: var(--bs-primary);

	pointer-events: none;
	font-size: var(--stylized-text-base);
	color: var(--bs-white);
	text-shadow:
		2px 2px 1rem var(--bs-black),
		-1px -1px 1px var(--bs-black),
		1px -1px 1px var(--bs-black),
		-1px 1px 1px var(--bs-black),
		1px 1px 1px var(--bs-black);

	#stylized-ampersand {
		position: relative;
		font-size: calc(var(--stylized-text-base) * 2);
		font-weight: bold;
		color: var(--stylized-ampersand-color);
		line-height: 0.3;
		margin-bottom: calc(var(--stylized-text-base) * -0.5);
		z-index: -1;
	}
}
</style>
