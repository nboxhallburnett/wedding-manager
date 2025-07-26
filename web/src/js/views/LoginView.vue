<script setup>
import { inject } from 'vue';
import Router from 'router';

import { useForm } from 'composables/form';

import CardHeader from 'components/CardHeader.vue';
import FormInput from 'components/form/FormInput.vue';

/** @type {Ref<Invitation>} */
const invitation = inject('invitation');
const invitationId = defineModel({ type: String });

const { onSubmit } = useForm({
	method: 'POST',
	path: 'session',
	body: { invitationId },
	onSuccess({ data }) {
		invitation.value = data;
		Router.replace(invitation.value.admin
			? { name: 'Admin Overview' }
			: { name: 'Home' }
		);
	}
});
</script>

<template>
	<form class="card-body" @submit.prevent="onSubmit">
		<card-header title="Manage your Invitation" />
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
