<script setup>
import { RouterLink } from 'vue-router';

defineProps({
	title: { type: String, required: true },
	action: { type: Object, default: null }
});
</script>

<template>
	<h4 class="card-title d-flex justify-content-between border-bottom pb-3">
		<span v-text="title" />
		<router-link v-if="action?.to && action?.text" class="btn btn-primary btn-sm" :to="action.to">
			{{ action.text }}
		</router-link>
	</h4>
</template>
