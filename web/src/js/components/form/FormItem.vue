<script setup>
defineProps({
	label: { type: String, default: '' },
	name: { type: String, required: true },
	groupClass: { type: String, default: 'input-group' }
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
			<div :class="groupClass">
				<slot />
			</div>
			<slot name="below" />
		</div>
	</div>
</template>
