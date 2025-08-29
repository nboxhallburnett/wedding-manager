<script setup>
import CardHeader from 'components/CardHeader.vue';
import RingLoader from 'components/RingLoader.vue';

defineProps({
	title: { type: String, default: '' }
});
</script>

<template>
	<div class="card-body w-100">
		<ring-loader />
		<card-header v-if="title" :title v-bind="$attrs" />
		<slot />
	</div>
</template>
