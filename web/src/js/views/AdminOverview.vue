<script setup>
import { inject, ref } from 'vue';

import API from 'lib/api';

const rsvps = ref([]);
const loading = inject('loading');
loading.value = true;

API('rsvp/query').then(({ result }) => {
	rsvps.value = result.data;
	loading.value = false;
}).catch(() => loading.value = false);
</script>

<template>
	<div class="card-body">
		<h5 class="card-title">
			Admin management
		</h5>
		<p class="card-text">
			{{ rsvps }}
		</p>
	</div>
</template>
