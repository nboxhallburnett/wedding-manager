<script setup>
import { inject, ref, useTemplateRef, onMounted } from 'vue';
import Router from 'router';

import { useForm } from 'composables/form';

const bride = CONFIG.bride_short;
const groom = CONFIG.groom_short;

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
	<div class="text-center d-inline-flex h1 mb-3 w-100">
		<h1 id="welcome-text" class="mb-3 w-100">
			{{ bride }}
			<div id="welcome-and" class="font-script px-1">&</div>
			{{ groom }}
		</h1>
	</div>

	<div class="container d-flex justify-content-center">
		<div class="col-xxl-4 col-xl-5 col-lg-6 col-md-7 col-sm-8 col-9 align-content-center">
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
		</div>
	</div>
</template>

<style lang="scss" scoped>
#welcome-text {
	font-size: max(10vmin, 8vh);
	color: var(--bs-white);
	text-shadow:
		2px 2px 1rem var(--bs-black),
		-1px -1px 0 var(--bs-black),
		1px -1px 0 var(--bs-black),
		-1px 1px 0 var(--bs-black),
		1px 1px 0 var(--bs-black);

	#welcome-and {
		position: relative;
		font-size: max(20vmin, 16vh);
		font-weight: bold;
		color: var(--bs-primary);
		line-height: 0.3;
		margin-bottom: min(-5vmin, -4vh);
		z-index: -1;
	}
}
</style>
