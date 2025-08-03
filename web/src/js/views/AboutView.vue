<script setup>
import { ref } from 'vue';
import { VueShowdown } from 'vue-showdown';

import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';

const content = ref('');
const aboutLoading = ref(true);

// Fetch the about content from the API
useLoader('about', content, aboutLoading);
</script>

<template>
	<card-header title="About" />
	<div v-if="aboutLoading" class="placeholder-wave">
		<span class="placeholder w-100 rounded-1" />
		<span class="placeholder w-75 rounded-1" />
		<span class="placeholder w-100 rounded-1" />
		<span class="placeholder w-25 rounded-1" />
		<br>
		<br>
		<span class="placeholder w-100 rounded-1" />
		<span class="placeholder w-100 rounded-1" />
		<span class="placeholder w-50 rounded-1" />
		<br>
		<br>
		<span class="placeholder w-100 rounded-1" />
		<span class="placeholder w-25 rounded-1" />
	</div>
	<div v-else-if="content" class="card-text">
		<vue-showdown :markdown="content" flavor="github" />
	</div>
</template>
