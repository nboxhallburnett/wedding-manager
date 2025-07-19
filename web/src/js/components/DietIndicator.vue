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
	<span v-bind="$attrs" class="d-inline-flex gap-1">
		<a
			v-if="vegan"
			:ref="$el => $els.push($el)"
			href="#"
			class="badge bg-success text-decoration-none align-top"
			title="Vegan"
			v-text="'VE'"
		/>
		<!-- All vegan meals are also vegetarian, so only show if not vegan -->
		<a
			v-else-if="vegetarian"
			:ref="$el => $els.push($el)"
			href="#"
			class="badge bg-primary text-decoration-none align-top"
			title="Vegetarian"
			v-text="'V'"
		/>
		<a
			v-if="glutenFree"
			:ref="$el => $els.push($el)"
			href="#"
			class="badge bg-dark text-decoration-none align-top"
			title="Gluten Free"
			v-text="'GF'"
		/>
	</span>
</template>
