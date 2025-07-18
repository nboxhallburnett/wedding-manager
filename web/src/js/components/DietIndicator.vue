<script setup>
import { useTooltip } from 'composables/tooltip';

const { $els } = useTooltip();

const { vegan, vegetarian, glutenFree } = defineProps({
	vegan: Boolean,
	vegetarian: Boolean,
	glutenFree: Boolean
});
</script>

<template>
	<a
		v-if="vegan"
		:ref="$el => $els.push($el)"
		href="#"
		class="badge bg-success text-decoration-none"
		title="Vegan"
		v-text="'VE'"
	/>
	<!-- All vegan meals are also vegetarian, so only show if not vegan -->
	<a
		v-else-if="vegetarian"
		:ref="$el => $els.push($el)"
		href="#"
		class="badge bg-primary text-decoration-none"
		title="Vegetarian"
		v-text="'V'"
	/>
	<a
		v-if="glutenFree"
		:ref="$el => $els.push($el)"
		href="#"
		class="badge bg-dark text-decoration-none"
		title="Gluten Free"
		v-text="'GF'"
	/>
</template>
