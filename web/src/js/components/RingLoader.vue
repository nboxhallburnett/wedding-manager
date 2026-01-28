<script setup>
import { inject } from 'vue';

defineProps({
	overlay: { type: Boolean, default: false }
});

/** @type {Ref<Boolean>} */
const loading = inject('loading');
</script>

<template>
	<div
		v-if="loading"
		class="loader-overlay"
		role="status"
		:class="{ 'position-fixed': overlay }"
	>
		<div class="ring-loader loading">
			<span class="visually-hidden">Loading...</span>
		</div>
	</div>
</template>
