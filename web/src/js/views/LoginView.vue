<script setup>
import { inject, ref, useTemplateRef, onMounted } from 'vue';
import Router from 'router';

import { useForm } from 'composables/form';

import CardHeader from 'components/CardHeader.vue';

/** @type {Ref<Invitation>} */
const invitation = inject('invitation');
const invitationId = ref('');

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

// Attempt to focus the input when the page is mounted if requested
const input = useTemplateRef('invitationInput');
onMounted(() => {
	input.value?.focus();
});
</script>

<template>
	<form @submit.prevent="onSubmit">
		<card-header title="Manage your Invitation" />
		<p class="card-text">
			Enter the ID included on your invitation below.
		</p>
		<div class="form-floating mb-3">
			<input
				id="invitationId"
				ref="invitationInput"
				v-model="invitationId"
				type="text"
				class="form-control"
				placeholder="Invitation ID"
			>
			<label for="invitationId">Invitation ID</label>
		</div>
		<button :disabled="!invitationId" class="btn btn-primary w-100" type="submit">
			Submit
		</button>
	</form>
</template>
