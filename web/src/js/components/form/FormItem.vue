<script setup>
import { usePopover } from 'composables/popover';

defineProps({
	label: { type: String, default: '' },
	hint: { type: String, default: '' },
	name: { type: String, required: true },
	groupClass: { type: String, default: 'input-group' }
});

const { $els } = usePopover({
	trigger: 'hover focus'
});
</script>

<template>
	<div class="row mb-3">
		<label
			v-if="label"
			:for="name"
			class="col-sm-3 col-form-label"
		>
			{{ label }}
			<a
				v-if="hint"
				:ref="$el => $els.push($el)"
				:data-bs-content="hint"
				href="#"
				class="icon-info"
			>?</a>
		</label>
		<div :class="label ? 'col-sm-9' : 'col-12'">
			<div :class="groupClass">
				<slot />
			</div>
			<slot name="below" />
		</div>
	</div>
</template>
