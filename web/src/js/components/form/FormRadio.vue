<script setup>
import FormItem from './FormItem.vue';

const model = defineModel({ type: [ String, Number, Boolean ] });
const props = defineProps({
	label: { type: String, default: '' },
	name: { type: String, required: true },
	options: {
		type: Array,
		required: true,
		validator(value) {
			return !value.some(option => {
				if (!Object.prototype.hasOwnProperty.call(option, 'value')) {
					console.error('Options must include a value');
					return true;
				}
				return false;
			});
		}
	}
});

</script>

<template>
	<form-item
		label-class="pt-0"
		group-class=""
		:label
		:name
	>
		<div v-for="option in options" :key="option.value" class="form-check mb-2">
			<input
				:id="`${props.name}-option-${option.value}`"
				v-model="model"
				class="form-check-input"
				type="radio"
				:name="`${props.name}-option-${option.value}`"
				:value="option.value"
			>
			<label class="form-check-label" :for="`${props.name}-option-${option.value}`">
				<span v-text="option.text || option.value" />
				<slot name="after-each" :item="option.item" />
			</label>
		</div>
		<slot name="after" />
	</form-item>
</template>
