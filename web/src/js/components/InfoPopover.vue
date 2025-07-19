<script setup>
import { usePopover } from 'composables/popover';

defineProps({
	hint: { type: String, default: '' }
});

const { $els } = usePopover({
	trigger: 'hover focus'
});
</script>

<template>
	<a
		v-if="hint"
		:ref="$el => $els.push($el)"
		:data-bs-content="hint"
		href="#"
		class="icon-info align-middle ms-1"
		@click.prevent
	>
		<span class="visually-hidden">Info</span>
	</a>
</template>
