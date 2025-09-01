<script setup>
import { inject, onMounted, nextTick, provide, ref, useTemplateRef, watch } from 'vue';
import { RouterView } from 'vue-router';

const invitation = inject('invitation');

import RingLoader from 'components/RingLoader.vue';
import SiteFooter from 'components/SiteFooter.vue';
import SiteHeader from 'components/SiteHeader.vue';
import ToastContainer from 'components/ToastContainer.vue';
import StylizedNames from 'components/StylizedNames.vue';
import WelcomeDisplay from 'components/WelcomeDisplay.vue';

const toastContainerComponent = ref(null);
provide('addToast', addToast);
function addToast(toast, options) {
	toastContainerComponent.value.addToast(toast, options);
}

// We only want the welcome display to be on the DOM until it's finished as it's an overlay
let showWelcome = ref(true);
function welcomeCleanup() {
	showWelcome.value = false;
}

const fadingNamesContainer = useTemplateRef('fadingNamesContainer');
const viewContainer = useTemplateRef('viewContainer');
const appContainer = useTemplateRef('appContainer');

// Wire up the welcome message fade effect when the app has mounted
onMounted(() => {
	// This can only be wired up when there is a valid session and we're using the authenticated layout,
	// so watch the invitation ref to check we have a session before attempting to reference anything
	watch(() => invitation.value, hasSession => {
		if (!hasSession) {
			return;
		}

		// If we've got a session, wait until the next tick to ensure everything is on the DOM ready for
		// us to reference.
		nextTick(() => {
			// Set an arbitrary 150px window for the fade effect to occur in
			const scrollSize = 150;
			// Fetch the height of the header from the css var to use as the ceiling for the scroll
			const headerHeight = Number(getComputedStyle(document.body)
				.getPropertyValue('--header-height')
				.split('px')[0]);

			// Track the current opacity so we only modify the style when it changes
			let currentOpacity = fadingNamesContainer.value.style.opacity;
			// Store a ref to the lower bound height that we'd want for the scroll effect
			const maxScroll = headerHeight + scrollSize;
			// Store a ref to the base percentage calculation. One less thing to calculate in the scroll hander
			const opacityCalcBase = 100 / scrollSize;

			// Wire up a listener on scroll to apply changes to the opacity
			// I wish we could use IntersectionObserver for this, but the elements aren't ancestors.
			appContainer.value.addEventListener('scroll', () => {
				// Get just the top of the view container for our position calculations
				const { top: distanceFromViewportTop } = viewContainer.value.getBoundingClientRect();
				// If the opacity of the names is already 0 and the container is scrolled "above" the header,
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
					// And apply the value to the container's styles
					fadingNamesContainer.value.style.opacity = opacityStep;
				}
			});
		});
	}, { immediate: true });
});
</script>

<template>
	<div id="background-overlay" class="bg-blur" />
	<template v-if="invitation">
		<toast-container ref="toastContainerComponent" />
		<header>
			<site-header />

			<div id="fading-names-container" ref="fadingNamesContainer" class="mt-3">
				<stylized-names />
			</div>
		</header>

		<div id="app-container" ref="appContainer">
			<div id="view-container" ref="viewContainer" class="container-fluid d-flex justify-content-center mb-5">
				<div class="col-xxl-7 col-xl-8 col-lg-9 col-md-10 col-sm-11 col-12 card shadow">
					<router-view v-slot="{ Component, route }">
						<transition :name="route.meta.transition || 'fade'">
							<component :is="Component" />
						</transition>
					</router-view>
				</div>
			</div>
		</div>

		<site-footer />
	</template>
	<template v-else>
		<ring-loader overlay />
		<welcome-display v-if="showWelcome" @finished="welcomeCleanup" />
		<div id="login-container" class="d-flex flex-column">
			<stylized-names :class="{ 'opacity-0': showWelcome }" />

			<div class="container d-flex justify-content-center">
				<div class="col-xxl-4 col-xl-5 col-lg-6 col-md-7 col-sm-8 col-9 align-content-center">
					<router-view />
				</div>
			</div>
		</div>
	</template>
</template>

<style lang="scss">
#background-overlay {
	position: fixed;
	top: 0;
	width: 100%;
	height: 100%;
	z-index: -1;
	overflow-y: scroll;

	// If there is a modal open, render the overlay on top of the page content
	.modal-open & {
		z-index: 15;
	}
}

#app-container {
	position: absolute;
	padding-top: var(--card-offset);
	top: var(--header-height);
	overflow: auto;
	max-height: calc(100vh - var(--header-height));
	width: 100%;

	// Adjust the container height to account for the footer on smaller viewports
	@media (max-width: 768px) {
		max-height: calc(100vh - var(--header-height) - var(--footer-height));
	}
}

// Render the page content above the footer elements
#view-container > div {
	z-index: 1;
}

#fading-names-container {
	position: fixed;
	top: var(--header-height);
	width: 100%;
	text-align: center;
	justify-self: center;
	opacity: 1;
	transition: opacity 0.2s;
}

#login-container {
	margin-top: 25vh;

	// Override the stylized names text size base for the login view
	#stylized-names {
		--stylized-text-base: max(10vmin, 8vh);
	}
}

// Vue transition component styling

.fade-enter-active,
.fade-leave-active {
	transition: all 0.15s ease-out;
}

.fade-enter-from,
.fade-leave-to {
	position: absolute;
	opacity: 0;
	filter: blur(1px);
}

.list-move,
.list-enter-active,
.list-leave-active {
	transition: all 0.2s ease;
}

.list-enter-from,
.list-leave-to {
	opacity: 0;
	transform: translateX(10px);
}

.list-leave-active {
	position: absolute;
}
</style>
