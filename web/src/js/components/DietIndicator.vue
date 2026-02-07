<script setup>
import { useTooltip } from 'composables/tooltip.js';

const { $els } = useTooltip();

const { item } = defineProps({
	item: { type: Object, required: true }
});
</script>

<template>
	<span v-bind="$attrs" class="d-inline-flex gap-1">
		<a
			v-if="item.vegan"
			:ref="$el => $els.push($el)"
			href="#"
			class="badge bg-success text-decoration-none align-top"
			title="Vegan"
			v-text="'VE'"
			@click.prevent
		/>
		<!-- All vegan meals are also vegetarian, so only show if not vegan -->
		<a
			v-else-if="item.vegetarian"
			:ref="$el => $els.push($el)"
			href="#"
			class="badge bg-vegetarian text-decoration-none align-top"
			title="Vegetarian"
			v-text="'V'"
			@click.prevent
		/>
		<a
			v-if="item.glutenFree"
			:ref="$el => $els.push($el)"
			href="#"
			class="badge bg-dark text-decoration-none align-top"
			title="Gluten Free"
			v-text="'GF'"
			@click.prevent
		/>
	</span>
</template>
