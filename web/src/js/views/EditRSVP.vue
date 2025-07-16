<script setup>
import { inject, ref } from 'vue';
import Router from 'router';

import FormInput from 'components/form/FormInput.vue';
import FormSelect from 'components/form/FormSelect.vue';
import API from 'lib/api';

const session = inject('invitation');
const addToast = inject('addToast');
const loading = inject('loading');
const invitation = ref({});

const statusOptions = [
	{ text: 'Attending', value: 1 },
	{ text: 'Tentative', value: 2 },
	{ text: 'Not Attending', value: 3 }
];

if (session.value.admin) {
	statusOptions.unshift({ text: 'Pending', value: 0 });
}

const adminEdit = Router.currentRoute.value.name === 'Admin Edit Invitation';

if (adminEdit) {
	loading.value = true;
	API(`invitation/${Router.currentRoute.value.params.invitationId}`).then(({ result }) => {
		invitation.value = result.data;
		loading.value = false;
	}).catch(() => loading.value = false);
} else {
	invitation.value = session.value;
}

function addGuest() {
	invitation.value.guests.push({
		name: '',
		status: 0
	});
}

function removeItem(idx) {
  	invitation.value.guests.splice(idx, 1);
}

async function onSubmit() {
	loading.value = true;
	await API(`invitation/${invitation.value.id}`, {
		method: 'PUT',
		body: invitation
	});
	const guestMsg = invitation.value.guests[0].name
		? `${invitation.value.guests[0].name}${invitation.value.guests.length > 1 ? ` & ${invitation.value.guests.length - 1} other guest${invitation.value.guests.length > 2 ? 's' : ''}` : ''}`
		: `${invitation.value.guests.length} guest${invitation.value.guests.length > 1 ? 's' : ''}`;
	addToast({
		title: 'Invitation Updated',
		body: adminEdit
			 ? `Invitation for ${guestMsg} successfully updated.`
			 : 'Invitation updated successfully. Thank you!'
	});
	loading.value = false;
	Router.push({ name: adminEdit ? 'Admin List Invitations' : 'Home' });
}
</script>

<template>
	<form class="card-body" @submit.prevent="onSubmit">
		<h5 class="card-title d-flex justify-content-between">
			{{ adminEdit ? 'Edit' : 'Update' }} Invitation
		</h5>
		<div v-for="(guest, idx) in invitation.guests" :key="idx" class="mb-3">
			<hr>
			<form-input v-model="guest.name" label="Name" :name="`guest-${idx}-name`">
				<template v-if="idx && session.admin" #after>
					<button type="button" class="btn btn-danger" @click="removeItem(idx)">
						Remove
					</button>
				</template>
			</form-input>
			<form-select
				v-model="guest.status"
				label="Status"
				:options="statusOptions"
				:default-option="0"
				placeholder="Pending Confirmation"
				:name="`guest-${idx}-status`"
			/>
		</div>
		<hr>
		<button
			v-if="session.admin"
			class="btn btn-primary mb-3"
			type="button"
			@click="addGuest"
		>
			Add +1
		</button>
		<button class="btn btn-primary w-100" type="submit">
			Submit
		</button>
	</form>
</template>
