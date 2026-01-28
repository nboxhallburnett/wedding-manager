<script setup>
import FormItem from './FormItem.vue';

const model = defineModel({ type: Boolean });
const props = defineProps({
	label: { type: String, default: '' },
	name: { type: String, required: true },
	placeholder: { type: String, default: '' },
	focus: { type: Boolean, default: false }
});
</script>

<template>
	<form-item group-class="form-check form-switch" :label :name>
		<input
			:id="props.name"
			v-bind="$attrs"
			ref="input"
			v-model="model"
			type="checkbox"
			role="switch"
			class="form-check-input"
			:name="props.name"
		>
		<slot name="after" />
	</form-item>
</template>

<style lang="scss">
.form-switch .form-check-input {
	font-size: x-large;
	margin-left: -2.5rem;
}
</style>
