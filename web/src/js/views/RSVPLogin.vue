<script setup>
import { inject } from 'vue';
import Router from 'router';

import API from 'lib/api';
import FormInput from 'components/form/FormInput.vue';

const rsvp = inject('rsvp');
const loading = inject('loading');
const rsvpId = defineModel({ type: String });

async function onSubmit() {
	loading.value = true;
	const response = await API('session', {
		method: 'POST',
		body: { rsvpId }
	});
	if (response.status === 200) {
		rsvp.value = response.result.data;
		Router.replace({ name: 'Home' });
	}
	loading.value = false;
}
</script>

<template>
	<form class="card-body" @submit.prevent="onSubmit">
		<h5 class="card-title">
			Manage your RSVP
		</h5>
		<p class="card-text">
			Enter the RSVP code included on your invitation below.
		</p>
		<form-input
			v-model="rsvpId"
			name="rsvpId"
			class="mb-3"
			aria-label="RSVP code entry"
			placeholder="Enter your RSVP code"
			focus
		/>
		<button :disabled="!rsvpId" class="btn btn-primary w-100" type="submit">
			Submit
		</button>
	</form>
</template>
