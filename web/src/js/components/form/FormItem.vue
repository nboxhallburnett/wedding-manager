<script setup>
import { inject, watch } from 'vue';

import InfoPopover from 'components/InfoPopover.vue';

const errors = inject('errors', {});
const validate = inject('validate', () => {});
const props = defineProps({
	label: { type: String, default: '' },
	hint: { type: String, default: '' },
	name: { type: String, required: true },
	groupClass: { type: String, default: 'input-group' },
	labelClass: { type: String, default: '' },
	rowClass: { type: String, default: 'mb-3' },
	validation: { type: [ Boolean, String ], default: false }
});

// A trackable listener function to call the validation function specifically for the instance value
function errorWatcher() {
	validate(props.name);
}

// Watch any error value exposed for the instance
watch(() => errors.value?.[props.name], (err, prev) => {
	if (err !== prev) {
		const $input = document.getElementById(props.name);
		if (!$input) {
			return;
		}

		// Set the custom error message on the element
		$input?.setCustomValidity(err || '');
		// And wire up a listener to re-trigger validation on value change until the field is valid
		if (err) {
			$input.addEventListener('keyup', errorWatcher);
		} else {
			$input.removeEventListener('keyup', errorWatcher);
		}
	}
});
</script>

<template>
	<div class="row" :class="rowClass">
		<label
			v-if="label"
			:for="name"
			class="col-sm-3 col-form-label"
			:class="labelClass"
		>
			{{ label }}
			<info-popover :hint />
		</label>
		<div :class="label ? 'col-sm-9' : 'col-12'">
			<div :class="[ groupClass, { 'has-validation': validation } ]">
				<slot />
				<div v-if="errors[name] || typeof validation === 'string'" class="invalid-tooltip" v-text="errors[name] || validation" />
			</div>
			<slot name="below" />
		</div>
	</div>
</template>
