<script setup>
import { RouterLink } from 'vue-router';

defineProps({
	title: { type: String, required: true },
	action: { type: Object, default: null }
});
</script>

<template>
	<h4 class="card-title d-flex justify-content-between border-bottom pb-3 bg-body">
		<span v-text="title" />
		<span>
			<slot>
				<router-link v-if="action?.to && action?.text" class="btn btn-primary btn-sm" :to="action.to">
					{{ action.text }}
				</router-link>
			</slot>
		</span>
	</h4>
</template>

<style lang="scss" scoped>
h4 {
	z-index: 5;
	position: sticky;
	top: var(--header-height);
	padding-top: 1rem;
}
</style>
