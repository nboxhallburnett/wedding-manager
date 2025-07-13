<script setup>
import API from 'lib/api';
import { computed, inject } from 'vue';
import { RouterLink } from 'vue-router';

const rsvp = inject('rsvp');
const loading = inject('loading');

const navItems = computed(() => {
	const items = [
		rsvp.value?.id
			? { text: 'Home', to: { name: 'Home' } }
			: { text: 'Home', to: { name: 'Login' } },
		{ text: 'About', to: { name: 'About' } }
	];

	if (rsvp.value?.admin) {
		items.push({ text: 'Admin', to: { name: 'Admin Overview' } });
	}

	return items;
});

async function logout() {
	loading.value = true;
	const response = await API('session', { method: 'DELETE' });
	if (response.status === 204) {
		window.location = '/';
	} else {
		// TODO: Handle logout errors
	}
}
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
			<div class="navbar-nav w-100">
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

				<button v-if="rsvp" class=" ms-auto nav-item nav-link" @click="logout">
					Sign out
				</button>
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
