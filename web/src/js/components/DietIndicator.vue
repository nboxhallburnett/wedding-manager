<script setup>
import { useTooltip } from 'composables/tooltip';

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
			@click.prevent
			v-text="'VE'"
		/>
		<!-- All vegan meals are also vegetarian, so only show if not vegan -->
		<a
			v-else-if="item.vegetarian"
			:ref="$el => $els.push($el)"
			href="#"
			class="badge bg-primary text-decoration-none align-top"
			title="Vegetarian"
			@click.prevent
			v-text="'V'"
		/>
		<a
			v-if="item.glutenFree"
			:ref="$el => $els.push($el)"
			href="#"
			class="badge bg-dark text-decoration-none align-top"
			title="Gluten Free"
			@click.prevent
			v-text="'GF'"
		/>
	</span>
</template>
