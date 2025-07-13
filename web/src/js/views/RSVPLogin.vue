<script setup>
import { inject, onMounted, ref } from 'vue';
import Router from 'router';

import API from 'lib/api';

const rsvp = inject('rsvp');
const loading = inject('loading');
const rsvpId = defineModel({ type: String });

async function onSubmit() {
	loading.value = true;
	const response = await API('rsvp', {
		method: 'POST',
		body: { rsvpId }
	});
	if (response.status === 200) {
		rsvp.value = response.result.data;
	}
	Router.replace({ name: 'Home' });
	loading.value = false;
}

// Attempt to focus the rsvp input when the page is mounted
const rsvpInput = ref(null);
onMounted(() => rsvpInput.value?.focus());
</script>

<template>
	<form class="card-body" @submit.prevent="onSubmit">
		<h5 class="card-title">
			Manage your RSVP
		</h5>
		<p class="card-text">
			Enter the RSVP code included on your invitation below.
		</p>
		<input
			id="rsvpId"
			ref="rsvpInput"
			v-model="rsvpId"
			name="rsvpId"
			class="form-control mb-3"
			type="text"
			aria-label="RSVP code entry"
			placeholder="Enter your RSVP code"
		>
		<button :disabled="!rsvpId" class="btn btn-primary w-100" type="submit">
			Submit
		</button>
	</form>
</template>
