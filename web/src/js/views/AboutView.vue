<script setup>
import { inject, ref } from 'vue';
import { VueShowdown } from 'vue-showdown';

import API from 'lib/api';

/** @type {Ref<Boolean>} */
const loading = inject('loading');
/** @type {Ref<String>} */
const content = ref('');

loading.value = true;
API('about').then(({ result }) => {
	content.value = result.data;
	loading.value = false;
}).catch(() => loading.value = false);

const source = SOURCE;
</script>

<template>
	<div class="card-body">
		<h4 class="card-title">
			About
		</h4>
		<hr>
		<div v-if="content" class="card-text">
			<vue-showdown :markdown="content" flavor="github" />
		</div>
		<hr>
		<div class="card-text">
			Source:<br>
			<a :href="source" v-text="source" />
		</div>
	</div>
</template>
