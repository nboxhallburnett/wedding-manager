<script setup>
import { ref, onMounted } from 'vue';

import FormItem from './FormItem.vue';

const model = defineModel({ type: [ String, Number ] });
const props = defineProps({
	label: { type: String, default: '' },
	name: { type: String, required: true },
	placeholder: { type: String, default: '' },
	focus: { type: Boolean, default: false },
	type: { type: String, default: 'text' }
});

// Attempt to focus the input when the page is mounted if requested
const input = ref(null);
if (props.focus) {
	onMounted(() => input.value?.focus());
}
</script>

<template>
	<form-item :label :name>
		<input
			:id="props.name"
			v-bind="$attrs"
			ref="input"
			v-model="model"
			:name="props.name"
			class="form-control"
			:type="type"
			:placeholder="placeholder"
		>
		<slot name="after" />
	</form-item>
</template>
