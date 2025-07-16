<script setup>
const model = defineModel({ type: String });

const props = defineProps({
	label: { type: String, default: '' },
	value: { type: String, default: '' },
	name: { type: String, required: true }
});
</script>

<template>
	<div class="row mb-3">
		<label
			v-if="label"
			:for="name"
			class="col-sm-3 col-form-label"
			v-text="label"
		/>
		<div :class="label ? 'col-sm-9' : 'col-12'">
			<div class="input-group">
				<span
					:id="props.name"
					v-bind="$attrs"
					ref="input"
					:name="props.name"
					class="form-control-plaintext"
					v-text="value || model"
				/>
				<slot name="after" />
			</div>
		</div>
	</div>
</template>
