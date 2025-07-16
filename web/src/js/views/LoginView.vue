<script setup>
import { inject } from 'vue';
import Router from 'router';

import API from 'lib/api';
import FormInput from 'components/form/FormInput.vue';

const invitation = inject('invitation');
const loading = inject('loading');
const invitationId = defineModel({ type: String });

async function onSubmit() {
	loading.value = true;
	const response = await API('session', {
		method: 'POST',
		body: { invitationId }
	});
	if (response.status === 200) {
		invitation.value = response.result.data;
		Router.replace({ name: 'Home' });
	}
	loading.value = false;
}
</script>

<template>
	<form class="card-body" @submit.prevent="onSubmit">
		<h5 class="card-title">
			Manage your Invitation
		</h5>
		<p class="card-text">
			Enter the Invitation code included on your invitation below.
		</p>
		<form-input
			v-model="invitationId"
			name="invitationId"
			class="mb-3"
			aria-label="Invitation code entry"
			placeholder="Enter your Invitation code"
			focus
		/>
		<button :disabled="!invitationId" class="btn btn-primary w-100" type="submit">
			Submit
		</button>
	</form>
</template>
