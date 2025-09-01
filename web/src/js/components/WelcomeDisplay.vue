<script setup>
import { onMounted, onUnmounted } from 'vue';
import { dateFormatter } from 'lib/formatter';

import StylizedNames from './StylizedNames.vue';

const date = dateFormatter.format(CONFIG.date);

const emit = defineEmits([ 'finished' ]);

// Emit the finished event after the animations finish
setTimeout(() => emit('finished'), 8500);
// Or if the escape key is pressed
const escapeListener = $evt => {
	if ($evt.code === 'Escape') {
		emit('finished');
	}
};
onMounted(() => window.addEventListener('keyup', escapeListener));
// Clean up the event listener when the component is unmounted
onUnmounted(() => window.removeEventListener('keyup', escapeListener));
</script>

<template>
	<div id="welcome-overlay" class="text-center text-dark">
		<button
			type="button"
			class="btn-close p-3"
			aria-label="Close"
			@click="emit('finished')"
		/>
		<div id="save-the-date" class="font-script">
			Save the Date
		</div>
		<div id="welcome-date" v-text="date" />
	</div>
	<div id="welcome-names" class="gap-1">
		<stylized-names />
	</div>
</template>

<style lang="scss">
// Animation for the welcome items staggered fade in
@keyframes welcome-fade-in {
	0% { opacity: 0; }
	100% { opacity: 1; }
}

// And the entire components fade out effect before the login page is shown
@keyframes welcome-fade-out {
	0% {
		opacity: 1;
		background-color: var(--bs-primary);
	}

	100% {
		opacity: 0;
		background-color: var(--bs-secondary);
	}
}

// Animation for the stylized names component transitioning to where and how it displays on the login page
@keyframes welcome-slide-up {
	0% {
		--stylized-ampersand-color: var(--bs-secondary);

		transform: scale(0.75);
		color: var(--bs-body);
		text-shadow: none;
		margin-top: 62vh;
	}

	100% {
		margin-top: 25vh;
	}
}

// Define the styling for the main overlay container
#welcome-overlay {
	z-index: 1000;
	position: fixed;
	left: 0;
	top: 0;
	height: 100%;
	width: 100%;
	overflow: auto;
	user-select: none;
	animation-delay: 6.5s;
	animation-duration: 2s;
	animation-fill-mode: both;
	animation-name: welcome-fade-out;

	// Apply the same animation to each welcome section,
	// Each one will have its own delay where necessary
	> div {
		animation-duration: 1.5s;
		animation-fill-mode: both;
		animation-name: welcome-fade-in;
	}

	.btn-close {
		z-index: 1001;
		position: absolute;
		right: 0;
		font-size: large;
	}
}

// Position and set the deferred render time for the "Save the Date" text
#save-the-date {
	margin-top: 25vh;
	line-height: 1;
	font-size: calc(2rem + 7vmin);
	animation-delay: 0.5s;
}

// Position and set the deferred render time for the wedding date text
#welcome-date {
	position: absolute;
	top: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100%;
	min-width: 100%;
	font-size: calc(2rem + 4vmin);
	animation-delay: 2.5s;
}

// Position and set the deferred render time for the stylized names text
#welcome-names {
	z-index: 1000;
	position: absolute;
	min-width: 100%;
	top: 0;
	display: flex;
	justify-content: center;
	animation: 1.5s linear welcome-fade-in;
	animation-fill-mode: both;
	animation-delay: 4.5s;

	// Define the components content to match the use on the login page
	#stylized-names {
		--stylized-text-base: max(10vmin, 8vh);

		margin-top: 62vh;
		animation: 1.5s ease-in-out welcome-slide-up;
		animation-delay: 6.5s;
		animation-fill-mode: both;
	}
}
</style>
