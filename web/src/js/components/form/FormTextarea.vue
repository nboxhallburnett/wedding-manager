<script setup>
import { ref, onMounted } from 'vue';

import FormItem from './FormItem.vue';

const model = defineModel({ type: String });
const props = defineProps({
	label: { type: String, default: '' },
	name: { type: String, required: true },
	placeholder: { type: String, default: '' },
	focus: { type: Boolean, default: false }
});

// Attempt to focus the input when the page is mounted if requested
const input = ref(null);
if (props.focus) {
	onMounted(() => input.value?.focus());
}

</script>

<template>
	<form-item :label :name>
		<template #default>
			<textarea
				:id="props.name"
				v-bind="$attrs"
				ref="input"
				v-model="model"
				class="form-control"
				:name="props.name"
				:placeholder="placeholder"
			/>
			<slot name="after" />
		</template>
		<template #below>
			<slot name="below" />
		</template>
	</form-item>
</template>
