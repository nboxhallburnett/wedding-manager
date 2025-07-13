<script setup>
const bride = CONFIG.bride_short;
const groom = CONFIG.groom_short;
</script>

<template>
	<div id="welcome-banner" class="text-center d-inline-flex h1 mb-3">
		<h1 v-if="$router.currentRoute.value.name !== '404'" id="site-title" class="mb-3 px-5 pt-4">
			<span class="font-script">Welcome</span> to the wedding of
			<br>
			{{ groom }}<span class="font-script px-1">&</span>{{ bride }}
		</h1>
	</div>
</template>

<style lang="scss" scoped>
#welcome-banner {
	$artificial-margin: 250px;
	$banner-border-radius: 45%;

	border-bottom-left-radius: $banner-border-radius;
	border-bottom-right-radius: $banner-border-radius;
	box-shadow: 0 0 33px 42px var(--bs-secondary);
	background-color: var(--bs-secondary);
	overflow: hidden;

	// Add artificial negative top margin to make the border radius to appear to fade into the header
	margin-top: -1 * $artificial-margin;

	#site-title {
		// Add artificial top margin to make the border radius to appear to fade into the header
		margin-top: $artificial-margin;
	}
}

h1 .font-script {
	font-size: larger;
}
</style>
