<script setup>
import API from 'lib/api';
import { computed, inject } from 'vue';
import { RouterLink } from 'vue-router';

/** @type {Ref<Invitation>} */
const invitation = inject('invitation');
/** @type {Ref<Boolean>} */
const loading = inject('loading');

const navItems = computed(() => {
	// If there is no session, only show the login page
	if (!invitation.value?.id) {
		return [ { text: 'Home', to: { name: 'Login' } } ];
	}

	const items = [
		{ text: 'Home', to: { name: 'Home' } },
		{ text: 'About', to: { name: 'About' } }
	];

	if (GALLERY_IMAGES.length && invitation.value?.id) {
		items.push({ text: 'Gallery', to: { name: 'Gallery' } });
	}

	if (invitation.value?.admin) {
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
	<nav id="header" class="navbar navbar-expand-sm bg-body shadow px-3 w-100 position-fixed top-0">
		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbar-header"
			aria-controls="navbar-header"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon" />
		</button>
		<div id="navbar-header" class="collapse navbar-collapse">
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

				<button v-if="invitation" class="ms-sm-auto text-start nav-item nav-link" @click="logout">
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
