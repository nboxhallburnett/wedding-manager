<script setup>
import { inject } from 'vue';

/** @type {Ref<Boolean>} */
const loading = inject('loading');
</script>

<template>
	<div v-if="loading" class="loader-overlay" role="status">
		<div class="ring-loader loading">
			<span class="visually-hidden">Loading...</span>
		</div>
	</div>
</template>
