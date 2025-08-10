<script setup>
import { fromNow } from 'lib/formatter';
import { usePopover } from 'composables/popover';

const props = defineProps({
	date: { type: [ Date, Number, String ], required: true },
	opts: { type: Object, default: () => {} }
});

const { $els } = usePopover({
	trigger: 'hover focus',
	...props.opts
});
</script>

<template>
	<span :ref="$el => $els.push($el)" :data-bs-content="(date instanceof Date ? date : new Date(date)).toLocaleString()" v-text="fromNow(date)" />
</template>
