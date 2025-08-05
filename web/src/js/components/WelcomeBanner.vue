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

	padding-left: 3.5rem;
	padding-right: 3.5rem;
	border-bottom-left-radius: $banner-border-radius;
	border-bottom-right-radius: $banner-border-radius;
	box-shadow: 0 0 33px 42px var(--bs-secondary);
	background-color: var(--bs-secondary);
	overflow: hidden;
	opacity: 0.9;

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
