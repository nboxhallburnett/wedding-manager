<script setup>
import FormItem from './FormItem.vue';

const model = defineModel({ type: String });
const props = defineProps({
	label: { type: String, default: '' },
	value: { type: String, default: '' },
	name: { type: String, required: true }
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
			v-text="value || model"
		/>
		<slot name="after" />
	</form-item>
</template>
