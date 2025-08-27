<script setup>
import { dateFormatter } from 'lib/formatter';

const navItems = CONFIG.client.footer;

const date = dateFormatter.format(CONFIG.date);
// Calculate number of days from now until the configured date
const daysToGo = Math.floor((CONFIG.date - Date.now()) / (1000 * 60 * 60 * 24));
</script>

<template>
	<nav id="footer" class="navbar navbar-expand navbar-light px-3 mt-auto bg-blur">
		<div id="navbarFooter" class="collapse navbar-collapse">
			<div class="navbar-nav w-100 justify-content-between">
				<div class="d-flex">
					<template v-for="(item, idx) in navItems" :key="item.text">
						<template v-if="idx">
							|
						</template>
						<a :href="item.url" class="nav-item nav-link text-stroke" target="_blank">
							{{ item.text }}
						</a>
					</template>
				</div>
				<div class="d-flex text-stroke">
					<template v-if="daysToGo > 0">
						<div class="nav-item nav-link text-stroke pointer">
							{{ daysToGo }} Days
						</div>
						|
					</template>
					<div class="nav-item nav-link pointer text-stroke" v-text="date" />
				</div>
			</div>
		</div>
	</nav>
</template>

<style lang="scss">
#footer {
	z-index: 10;
	position: fixed;
	height: var(--footer-height);
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
