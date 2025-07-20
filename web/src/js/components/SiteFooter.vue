<script setup>
const navItems = CONFIG.client.footer;

// Formatter to make displayed date appropriately formatted for the users locale
const dateFormatter = new Intl.DateTimeFormat(undefined, {
	month: 'long',
	day: 'numeric',
	year: 'numeric',
	timezone: 'UTC'
});
const date = dateFormatter.format(CONFIG.date);
// Calculate number of days from now until the configured date
const daysToGo = Math.floor((CONFIG.date - Date.now()) / (1000 * 60 * 60 * 24));
</script>

<template>
	<nav id="footer" class="navbar navbar-expand navbar-light bg-body px-3 mt-auto">
		<div id="navbarFooter" class="collapse navbar-collapse">
			<div class="navbar-nav w-100">
				<template v-for="item in navItems" :key="item.text">
					<a :href="item.url" class="nav-item nav-link" target="_blank">
						{{ item.text }}
					</a>
				</template>
				<div class="ms-auto" />
				<div v-if="daysToGo > 0" class="nav-item nav-link pointer">
					{{ daysToGo }} Days
				</div>
				<template v-if="daysToGo > 0">
					|
				</template>
				<div class="nav-item nav-link pointer" v-text="date" />
			</div>
		</div>
	</nav>
</template>

<style lang="scss" scoped>
#footer {
	z-index: 10;
	position: fixed;
	bottom: 0;
	width: 100%;

	.nav-item {
		padding-top: 0;
		padding-bottom: 0;
	}

	div.nav-item {
		cursor: default;
	}
}
</style>
