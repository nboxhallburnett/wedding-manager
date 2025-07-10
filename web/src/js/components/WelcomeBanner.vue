<script setup>
const bride = CONFIG.bride_short;
const groom = CONFIG.groom_short;
</script>

<template>
	<div id="welcome-banner" class="text-center pt-4 w-100">
		<h1 v-if="$router.currentRoute.value.name !== '404'" id="site-title" class="mb-0">
			<span class="font-script">Welcome</span> to the wedding of
			<br>
			{{ groom }}<span class="font-script px-1">&</span>{{ bride }}
		</h1>
	</div>
	<div id="welcome-banner-fade" class="w-100" />
</template>

<style lang="scss" scoped>
#welcome-banner {
	background-color: var(--bs-secondary);
}
#welcome-banner-fade {
	background: linear-gradient(to bottom, var(--bs-secondary), transparent);
	height: 2.2rem;
}

h1 .font-script {
	font-size: larger;
}
</style>
