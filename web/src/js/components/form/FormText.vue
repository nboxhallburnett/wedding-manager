<script setup>
import { ref, watchEffect } from 'vue';
import FormItem from './FormItem.vue';

const model = defineModel({ type: [ String, Array ] });
const props = defineProps({
	label: { type: String, default: '' },
	value: { type: [ String, Array ], default: '' },
	name: { type: String, required: true }
});

const displayValue = ref(model.value || props.value || '');
watchEffect(() => {
	displayValue.value = model.value || props.value || '';
	if (Array.isArray(displayValue)) {
		displayValue.value = displayValue.value.join('\n');
	}
});
</script>

<template>
	<form-item :label :name>
		<span
			:id="props.name"
			v-bind="$attrs"
			ref="input"
			:name="props.name"
			class="form-control-plaintext"
			v-text="displayValue"
		/>
		<slot name="after" />
	</form-item>
</template>

<style lang="scss" scoped>
.form-control-plaintext {
	white-space: pre-wrap;
}
</style>
