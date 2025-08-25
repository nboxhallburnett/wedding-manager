<script setup>
const bride = CONFIG.bride_short;
const groom = CONFIG.groom_short;
</script>

<template>
	<div id="welcome-banner" class="text-center d-inline-flex h1 mb-3">
		<h1 id="site-title" class="text-dark mb-3 pt-4 fw-normal">
			<span class="font-script">Welcome</span> to the wedding of
			<br>
			{{ groom }}<span class="font-script px-1">&</span>{{ bride }}
		</h1>
	</div>
</template>

<style lang="scss">
#welcome-banner {
	$artificial-margin: 250px;
	$banner-border-radius: 45%;
	$blur-size: 15px;
	$banner-bg: rgba(var(--bs-secondary-rgb), 100%);

	padding-left: 3.5rem;
	padding-right: 3.5rem;
	border-bottom-left-radius: $banner-border-radius;
	border-bottom-right-radius: $banner-border-radius;
	background-color: $banner-bg;
	overflow: hidden;
	opacity: 0.9;
	filter:
		drop-shadow($blur-size $blur-size $blur-size $banner-bg)
		drop-shadow($blur-size calc($blur-size * -1) $blur-size $banner-bg)
		drop-shadow(calc($blur-size * -1) $blur-size $blur-size $banner-bg)
		drop-shadow(calc($blur-size * -1) calc($blur-size * -1) $blur-size $banner-bg);

	// Add artificial negative top margin to make the border radius to appear to fade into the header
	/* stylelint-disable-next-line declaration-property-value-no-unknown */
	margin-top: -1 * $artificial-margin;

	#site-title {
		// Add artificial top margin to make the border radius to appear to fade into the header
		margin-top: $artificial-margin;
	}
}

#site-title .font-script {
	font-size: larger;
}
</style>
