<script setup>
import { usePopover } from 'composables/popover';

const props = defineProps({
	hint: { type: String, default: '' },
	title: { type: String, default: undefined },
	opts: { type: Object, default: () => {} }
});

const { $els } = usePopover({
	trigger: 'hover focus',
	...props.opts
});
</script>

<template>
	<span
		v-if="hint"
		:ref="$el => $els.push($el)"
		:data-bs-content="hint"
		:title
	>
		<slot>
			<a href="#" class="icon-info align-middle ms-1" @click.prevent>
				<span class="visually-hidden">Info</span>
			</a>
		</slot>
	</span>
</template>
