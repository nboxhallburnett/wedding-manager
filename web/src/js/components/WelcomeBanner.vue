<script setup>
const bride = CONFIG.bride_short;
const groom = CONFIG.groom_short;
</script>

<template>
	<div id="welcome-banner" class="text-center d-inline-flex h1 mb-3">
		<h1 id="site-title" class="pb-3 pt-4 fw-normal text-stroke">
			<span class="font-script">Welcome</span> to the wedding of
			<br>
			{{ groom }}<span class="font-script px-1 fw-bolder text-primary">&</span>{{ bride }}
		</h1>
	</div>
</template>

<style lang="scss">
#welcome-banner {
	$blur-size: 25px;
	$banner-bg: rgb(var(--bs-secondary-rgb), 80%);

	padding-left: 3.5rem;
	padding-right: 3.5rem;
	overflow: hidden;
	filter:
		drop-shadow($blur-size $blur-size calc($blur-size * 0.75) $banner-bg)
		drop-shadow($blur-size calc($blur-size * -1) calc($blur-size * 0.75) $banner-bg)
		drop-shadow(calc($blur-size * -1) $blur-size calc($blur-size * 0.75) $banner-bg)
		drop-shadow(calc($blur-size * -1) calc($blur-size * -1) calc($blur-size * 0.75) $banner-bg);
}

#site-title .font-script {
	font-size: larger;

	&.fw-bolder {
		font-size: xxx-large;
	}
}
</style>
