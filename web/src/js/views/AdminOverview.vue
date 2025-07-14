<script setup>
import { inject, ref } from 'vue';
import { RouterLink } from 'vue-router';

import API from 'lib/api';

const rsvps = ref([]);
const loading = inject('loading');
loading.value = true;

API('rsvp').then(({ result }) => {
	rsvps.value = result.data;
	loading.value = false;
}).catch(() => loading.value = false);
</script>

<template>
	<div class="card-body">
		<h5 class="card-title mb-3">
			Admin Management
		</h5>
		<div class="card-text">
			<button class="btn btn-primary w-100 mb-2">
				View Stats
			</button>
			<router-link class="btn btn-primary w-100 mb-2" :to="{ name: 'Admin List RSVPs' }">
				List Invitations
			</router-link>
			<router-link class="btn btn-primary w-100 mb-2" :to="{ name: 'Admin Create RSVP' }">
				New Invitation
			</router-link>
		</div>
	</div>
</template>
