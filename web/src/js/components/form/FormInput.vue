<script setup>
import { ref, onMounted } from 'vue';

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
	<div class="row mb-2">
		<div class="col-md-3 align-content-center">
			<label
				v-if="label"
				:for="name"
				v-text="label"
			/>
		</div>
		<div class="col-md-9 align-content-center">
			<div class="input-group">
				<input
					:id="props.name"
					v-bind="$attrs"
					ref="input"
					v-model="model"
					:name="props.name"
					class="form-control"
					type="text"
					:placeholder="placeholder"
				>
				<slot name="after" />
			</div>
		</div>
	</div>
</template>
