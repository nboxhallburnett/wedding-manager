<script setup>
import { onMounted, onUnmounted } from 'vue';

// Formatter to make displayed date appropriately formatted for the users locale
const dateFormatter = new Intl.DateTimeFormat(undefined, {
	month: 'long',
	day: 'numeric',
	year: 'numeric',
	timezone: 'UTC'
});
const date = dateFormatter.format(CONFIG.date);

const bride = CONFIG.bride_short;
const groom = CONFIG.groom_short;

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
	<div id="welcome-overlay" class="text-center">
		<button
			type="button"
			class="btn-close p-3"
			aria-label="Close"
			@click="emit('finished')"
		/>
		<div id="welcome-text" class="font-script">
			Save the Date
		</div>
		<div id="welcome-date" v-text="date" />
		<div id="welcome-names" class="gap-1">
			<span v-text="groom" />
			<span class="font-script pt-3 px-2" v-text="'&'" />
			<span v-text="bride" />
		</div>
	</div>
</template>

<style lang="scss" scoped>
@keyframes fade-in {
	0% {opacity: 0;}
	100% {opacity: 1;}
}
@keyframes fade-out {
	0% {
		opacity: 1;
		background-color: var(--bs-secondary);
	}
	100% {
		opacity: 0;
		background-color: var(--bs-primary);
	}
}

#welcome-overlay {
	z-index: 1000;
	position: absolute;
	left: 0;
	top: 0;
	height: 100%;
	width: 100%;
	overflow: auto;
	user-select: none;
	animation-delay: 6.5s;
	animation-duration: 2s;
	animation-fill-mode: both;
	animation-name: fade-out;

	// Apply the same animation to each welcome section,
	// Each one will have its own delay where necessary
	> div {
		animation-duration: 1.5s;
		animation-fill-mode: both;
		animation-name: fade-in;
	}
}

#welcome-text {
	margin-top: 25vh;
	line-height: 1;
	font-size: calc(2rem + 7vmin);

	animation-delay: 0.5s;
}
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
#welcome-names {
	position: absolute;
	min-width: 100%;
	bottom: 0;
	margin-bottom: 25vh;
	font-size: calc(2rem + 4vmin);
	display: flex;
	flex-wrap: wrap;
	line-height: 1;
	justify-content: center;

	animation-delay: 4.5s;

	.font-script {
		font-size: calc(3rem + 8vmin);
		line-height: 0;
		align-self: center;
	}
}

.btn-close {
	z-index: 1001;
	font-size: large;
	position: absolute;
	right: 0;
}
</style>
