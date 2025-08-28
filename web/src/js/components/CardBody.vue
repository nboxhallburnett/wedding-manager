<script setup>
import RingLoader from 'components/RingLoader.vue';
</script>

<template>
	<div class="card-body w-100">
		<ring-loader />
		<slot />
	</div>
</template>
