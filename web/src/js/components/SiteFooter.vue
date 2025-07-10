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
</script>

<template>
	<nav id="footer" class="navbar navbar-expand navbar-light bg-light px-3 mt-auto">
		<div id="navbarFooter" class="collapse navbar-collapse">
			<div class="navbar-nav w-100">
				<template v-for="item in navItems" :key="item.text">
					<a :href="item.url" class="nav-item nav-link" target="_blank">
						{{ item.text }}
					</a>
				</template>
				<div class="nav-item nav-link ms-auto pointer" v-text="date" />
			</div>
		</div>
	</nav>
</template>

<style lang="scss" scoped>
#footer {
	position: absolute;
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
