<script setup>
import { ref } from 'vue';
import FormItem from './FormItem.vue';

const model = defineModel({ type: Array });
const props = defineProps({
	label: { type: String, default: '' },
	name: { type: String, required: true },
	placeholder: { type: String, default: '' }
});

// Expose the item elements for custom handling on interaction, such as focusing on add
const $items = ref([]);
defineExpose({ $items });

function removeItem(idx) {
	model.value.splice(idx, 1);
}

</script>

<template>
	<form-item group-class="d-flex flex-wrap gap-2" :label :name>
		<template v-for="(_item, idx) in model" :key="idx">
			<div class="input-group">
				<input
					:id="idx === 0 ? props.name : undefined"
					v-bind="$attrs"
					:ref="$el => $items[idx] = $el"
					v-model="model[idx]"
					class="form-control"
					type="text"
					:name="idx === 0 ? props.name : undefined"
					:placeholder="placeholder"
				>
				<button
					type="button"
					class="btn btn-danger"
					aria-label="Remove Item"
					@click="removeItem(idx)"
				>
					<div class="btn-close btn-close" />
					<div class="visually-hidden">
						Remove
					</div>
				</button>
			</div>
		</template>
		<slot name="after" />
	</form-item>
</template>
