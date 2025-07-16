<script setup>
import { inject, provide, ref } from 'vue';
import { RouterView } from 'vue-router';

const invitation = inject('invitation');

import RingLoader from 'components/RingLoader.vue';
import SiteFooter from 'components/SiteFooter.vue';
import SiteHeader from 'components/SiteHeader.vue';
import ToastContainer from 'components/ToastContainer.vue';
import WelcomeBanner from 'components/WelcomeBanner.vue';
import WelcomeDisplay from 'components/WelcomeDisplay.vue';

const toastContainerComponent = ref(null);
provide('addToast', addToast);
function addToast(toast) {
	toastContainerComponent.value.addToast(toast);
}

// We only want the welcome display to be on the DOM until it's finished as it's an overlay
let showWelcome = ref(true);
function welcomeCleanup() {
	showWelcome.value = false;
}
</script>

<template>
	<toast-container ref="toastContainerComponent" />
	<welcome-display v-if="!invitation && showWelcome" @finished="welcomeCleanup" />
	<ring-loader />

	<header class="mb-5">
		<div class="wrapper">
			<site-header />

			<div class="text-center">
				<welcome-banner />
			</div>
		</div>
	</header>

	<div class="container d-flex justify-content-center mb-5">
		<div class="col-xxl-7 col-xl-8 col-lg-9 col-md-10 col-sm-11 col-12 card shadow">
			<RouterView />
		</div>
	</div>

	<site-footer />
</template>
