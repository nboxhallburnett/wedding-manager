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
			data-bs-target="#navbarNavAltMarkup"
			aria-controls="navbarNavAltMarkup"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon" />
		</button>
		<div id="navbarNavAltMarkup" class="collapse navbar-collapse">
			<div class="navbar-nav">
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
