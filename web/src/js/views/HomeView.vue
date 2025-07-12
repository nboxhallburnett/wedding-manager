<script setup>
import { inject } from 'vue';

import API from 'lib/api';

const rsvp = inject('rsvp');
const loading = inject('loading');
const rsvpId = defineModel({ type: String });

async function onClick() {
	loading.value = true;
	const response = await API('rsvp', {
		method: 'POST',
		body: { rsvpId }
	});
	if (response.status === 200) {
		rsvp.value = response.result.data;
	}
	loading.value = false;
}
</script>

<template>
	<div class="card-body">
		<h5 class="card-title">
			Manage your RSVP
		</h5>
		<p class="card-text">
			Enter the RSVP code included on your invitation below.
		</p>
		<input
			v-model="rsvpId"
			class="form-control mb-3"
			type="text"
			placeholder="Enter your RSVP code"
		>
		<button :disabled="!rsvpId" class="btn btn-primary w-100" @click="onClick">
			Submit
		</button>

		{{ rsvp || '' }}
	</div>
</template>
