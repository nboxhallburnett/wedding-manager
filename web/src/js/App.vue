<script setup>
import { inject, onMounted, provide, ref, useTemplateRef } from 'vue';
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

const welcomeBannerContainer = useTemplateRef('welcomeBannerContainer');
const viewContainer = useTemplateRef('viewContainer');

// Wire up the welcome message fade effect when the app has mounted
onMounted(() => {
	// Set an arbitrary 150px window for the fade effect to occur in
	const scrollSize = 150;
	// Fetch the height of the header from the css var to use as the ceiling for the scroll
	const headerHeight = Number(getComputedStyle(document.body)
		.getPropertyValue('--header-height')
		.split('px')[0]);

	// Track the current opacity so we only modify the style when it changes
	let currentOpacity = welcomeBannerContainer.value.style.opacity;
	// Store a ref to the lower bound height that we'd want for the scroll effect
	const maxScroll = headerHeight + scrollSize;
	// Store a ref to the base percentage calculation. One less thing to calculate in the scroll hander
	const opacityCalcBase = 100 / scrollSize;

	// Wire up a listener on scroll to apply changes to the opacity
	// I wish we could use IntersectionObserver for this, but the elements aren't ancestors.
	document.addEventListener('scroll', () => {
		// Get just the top of the view container for our position calculations
		const { top: distanceFromViewportTop } = viewContainer.value.getBoundingClientRect();
		// If the opacity of the welcome banner is already 0 and the container is scrolled "above" the header,
		// we've got nothing to do here so fall out
		if (!currentOpacity && distanceFromViewportTop < headerHeight) {
			return;
		}
		// Likewise, if the opacity is 1 and the container is below the lower bound, there's no changes to make
		if (currentOpacity === 1 && distanceFromViewportTop > maxScroll) {
			return;
		}

		// Calculate the percentage of the way through the scroll window the container is
		const scrollWindowPercent = opacityCalcBase * ((Math.min(distanceFromViewportTop, maxScroll)) - headerHeight);
		// To reduce how frequently we update the actual styles, round the percentage to 10% increments
		const opacityStep = Math.max(Math.round(scrollWindowPercent / 10) / 10, 0);
		// If the calculated step is different to the currently applied style...
		if (opacityStep !== currentOpacity) {
			// Store it as the new reference step
			currentOpacity = opacityStep;
			// And apply the value to the banner's styles
			welcomeBannerContainer.value.style.opacity = opacityStep;
		}
	});
});
</script>

<template>
	<welcome-display v-if="!invitation && showWelcome" @finished="welcomeCleanup" />

	<ring-loader />
	<toast-container ref="toastContainerComponent" />

	<header>
		<site-header />

		<div id="welcome-banner-container" ref="welcomeBannerContainer">
			<welcome-banner />
		</div>
	</header>

	<div id="view-container" ref="viewContainer" class="container d-flex justify-content-center">
		<div class="col-xxl-7 col-xl-8 col-lg-9 col-md-10 col-sm-11 col-12 card shadow">
			<div class="card-body pt-0">
				<router-view />
			</div>
		</div>
	</div>

	<site-footer />
</template>

<style lang="scss" scoped>
header {
	margin-bottom: 175px;
}

#view-container {
	margin-bottom: 5rem;
}

#welcome-banner-container {
	position: fixed;
	top: var(--header-height);
	width: 100%;
	text-align: center;
	justify-self: center;
	opacity: 1;
	transition: opacity 0.2s;
}
</style>
