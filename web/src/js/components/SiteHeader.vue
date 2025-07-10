<script setup>
import { RouterLink } from 'vue-router';
const navItems = [
	{ text: 'Home', to: { name: 'home' } },
	{ text: 'About', to: { name: 'about' } }
];
</script>

<template>
	<nav class="navbar navbar-expand-sm navbar-light bg-light px-3">
		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarHeader"
			aria-controls="navbarHeader"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon" />
		</button>
		<div id="navbarHeader" class="collapse navbar-collapse">
			<div class="navbar-nav">
				<div class="ring-loader d-none d-sm-block" />
				<router-link
					v-for="item in navItems"
					:key="item.text"
					:to="item.to"
					class="nav-item nav-link"
					:class="{ active: $router.currentRoute.value.name === item.to.name }"
				>
					{{ item.text }}
				</router-link>
			</div>
		</div>
	</nav>
</template>

<style lang="scss" scoped>
.ring-loader {
	margin: 0;
	position: relative;
	width: 40px;
	height: 40px;
	top: 4px;
	left: -8px;
}
</style>
