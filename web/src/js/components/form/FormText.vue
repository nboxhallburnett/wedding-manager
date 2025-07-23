<script setup>
import { ref, watchEffect } from 'vue';
import FormItem from './FormItem.vue';

const model = defineModel({ type: [ String, Number, Array ] });
const props = defineProps({
	label: { type: String, default: '' },
	value: { type: [ String, Number, Array ], default: '' },
	name: { type: String, required: true }
});

const displayValue = ref(model.value || props.value || '');
watchEffect(() => {
	let text = model.value || props.value || '';
	if (Array.isArray(text)) {
		text = text.join('\n');
	}
	displayValue.value = text;
});
</script>

<template>
	<form-item :label :name>
		<span
			:id="props.name"
			v-bind="$attrs"
			ref="input"
			:name="props.name"
			class="form-control-plaintext ws-pre-wrap"
			v-text="displayValue"
		/>
		<slot name="after" />
	</form-item>
</template>
