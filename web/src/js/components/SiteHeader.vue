<script setup>
import 'bootstrap/js/dist/collapse';

import API from 'lib/api';
import { computed, inject, ref, useTemplateRef } from 'vue';
import { RouterLink } from 'vue-router';

/** @type {AddToast} */
const addToast = inject('addToast');
/** @type {Ref<Invitation>} */
const invitation = inject('invitation');
/** @type {Ref<Boolean>} */
const loading = inject('loading');

const feedback = ref('');
const $feedbackToggle = useTemplateRef('feedbackToggle');
const $navbarToggle = useTemplateRef('navbarToggle');

const registryUrl = CONFIG.registry_url || '';

document.body.classList.add('has-header');

const navItems = computed(() => {
	// If there is no session, only show the login page
	if (!invitation.value?.id) {
		return [ { text: 'Home', to: { name: 'Login' } } ];
	}

	const items = [
		{ text: 'Details', to: { name: 'About' } },
		{ text: 'Q&A', to: { name: 'Q&A' } },
		{ text: 'Our Story', to: { name: 'Our Story' } },
		{ text: 'Gallery', to: { name: 'Gallery' } }
	];

	if (registryUrl) {
		items.push({ text: 'Registry', url: registryUrl });
	}

	// Use the admin page as home if there is an admin session
	if (invitation.value?.admin) {
		items.unshift({ text: 'Home', to: { name: 'Admin Overview' }, pathMatch: /^\/admin/ });

	// Otherwise use the actual home page
	} else {
		items.unshift({ text: 'Home', to: { name: 'Home' }, pathMatch: /^\/(?:edit)?$/ });
	}

	return items;
});

/**
 * Toggles the navbar. Used as an additional click listener on router links so the navbar closes on navigation
 */
function collapseNavbar() {
	// Use aria-expanded rather than checking for the collapsed class so it works regardless of whether it's been toggled
	if ($navbarToggle.value.getAttribute('aria-expanded') === 'false') {
		return;
	}
	$navbarToggle.value.click();
}

/**
 * Calls the session logout API and redirects the user back to the login page
 */
async function logout() {
	loading.value = true;
	const response = await API('session', { method: 'DELETE' });
	if (response.status === 204) {
		window.location = '/';
	} else {
		// TODO: Handle logout errors
	}
}

/**
 * Posts any supplied feedback to the feedback API and resets the dropdown
 */
async function submitFeedback() {
	// Don't attempt to submit an empty message
	if (!feedback.value) {
		return;
	}

	loading.value = true;
	const response = await API('feedback', { method: 'POST', body: { message: feedback } });
	if (response.status === 204) {
		addToast({
			title: 'Feedback Sent',
			body: 'We look forward to hearing what you had to say!'
		});
	} else {
		addToast({
			title: 'Feedback Error',
			body: 'I\'m sure that wasn\'t the feedback you wanted to send, but I should see it anyway...'
		});
	}
	feedback.value = '';
	$feedbackToggle.value.click();
	loading.value = false;
}
</script>

<template>
	<nav id="header" class="navbar navbar-expand-sm shadow px-3 w-100 position-fixed top-0 bg-blur">
		<button
			ref="navbarToggle"
			class="navbar-toggler bg-primary"
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
				<div class="ring-loader d-none d-sm-block" data-bs-theme="dark" />
				<template v-for="item in navItems" :key="item.text">
					<router-link
						v-if="item.to"
						class="nav-item nav-link text-stroke"
						:to="item.to"
						:class="{ active: $route.name === item.to.name || item.pathMatch?.test($route.path) }"
						@click="collapseNavbar"
					>
						{{ item.text }}
					</router-link>
					<a
						v-else-if="item.url"
						class="nav-item nav-link text-stroke"
						target="_blank"
						:href="item.url"
						v-text="item.text"
					/>
				</template>

				<template v-if="invitation">
					<div class="ms-sm-auto nav-item dropdown">
						<button
							ref="feedbackToggle"
							class="text-start dropdown-toggle nav-link h-100 text-stroke"
							type="button"
							data-bs-auto-close="outside"
							data-bs-toggle="dropdown"
							aria-expanded="false"
						>
							Feedback
						</button>
						<div id="feedback-menu" class="dropdown-menu p-3">
							<div class="mb-3">
								<textarea
									id="feedback-input"
									v-model="feedback"
									type="text"
									class="form-control"
									rows="5"
									maxlength="512"
									placeholder="Comments or feedback you have for the website or the wedding"
								/>
							</div>
							<button
								type="submit"
								class="btn btn-primary btn-sm"
								:disabled="!feedback"
								@click.prevent.stop="submitFeedback"
							>
								Submit
							</button>
						</div>
					</div>

					<button class="text-start nav-item nav-link text-stroke" @click="logout">
						Sign out
					</button>
				</template>
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

#feedback-menu {
	min-width: 175px;
}
</style>
