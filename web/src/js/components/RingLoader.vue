<script setup>
import { inject } from 'vue';

const loading = inject('loading');
</script>

<template>
	<div v-if="loading" class="loader-overlay">
		<div class="ring-loader loading" />
	</div>
</template>
