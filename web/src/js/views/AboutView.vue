<script setup>
import { ref } from 'vue';
import { VueShowdown } from 'vue-showdown';

import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';

// The source code's repository, set from webpack
const source = SOURCE;

/** @type {Ref<String>} */
const content = ref('');

// Fetch the about content from the API
useLoader('about', content);
</script>

<template>
	<card-header title="About" />
	<div v-if="content" class="card-text">
		<vue-showdown :markdown="content" flavor="github" />
	</div>
	<hr>
	<div class="card-text">
		Source:<br>
		<a :href="source" target="_blank" v-text="source" />
	</div>
</template>
