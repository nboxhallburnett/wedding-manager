<script setup>
import { ref } from 'vue';
import { RouterView } from 'vue-router';

import RingLoader from 'components/RingLoader.vue';
import SiteHeader from 'components/SiteHeader.vue';
import SiteFooter from 'components/SiteFooter.vue';
import WelcomeDisplay from 'components/WelcomeDisplay.vue';
import WelcomeBanner from 'components/WelcomeBanner.vue';

// We only want the welcome display to be on the DOM until it's finished as it's an overlay
let showWelcome = ref(true);
function welcomeCleanup() {
	showWelcome.value = false;
}
</script>

<template>
	<welcome-display v-if="showWelcome" @finished="welcomeCleanup" />
	<ring-loader />

	<header class="mb-5">
		<div class="wrapper">
			<site-header />

			<div class="text-center">
				<welcome-banner />
			</div>
		</div>
	</header>

	<div class="container d-flex justify-content-center">
		<div class="col-xl-6 col-lg-7 col-md-8 col-sm-10 col-12 card">
			<RouterView />
		</div>
	</div>

	<site-footer />
</template>
