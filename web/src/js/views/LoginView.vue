<script setup>
import { inject, ref, useTemplateRef, onMounted } from 'vue';
import Router from 'router';

import { useForm } from 'composables/form';

/** @type {Ref<Invitation>} */
const invitation = inject('invitation');
const invitationId = ref(Router.currentRoute.value.query.id || '');

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
	<form class="card-text" @submit.prevent.stop="onSubmit">
		<h4 class="pb-1 text-stroke">
			Manage your RSVP
		</h4>
		<p class="text-stroke">
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
