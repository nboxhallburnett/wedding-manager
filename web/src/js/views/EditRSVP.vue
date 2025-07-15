<script setup>
import { inject, ref } from 'vue';
import Router from 'router';

import FormInput from 'components/form/FormInput.vue';
import API from 'lib/api';

const session = inject('rsvp');
const addToast = inject('addToast');
const loading = inject('loading');
const rsvp = ref({});

const adminEdit = Router.currentRoute.value.name === 'Admin Edit RSVP';

if (adminEdit) {
	loading.value = true;
	API(`rsvp/${Router.currentRoute.value.params.rsvpId}`).then(({ result }) => {
		rsvp.value = result.data;
		loading.value = false;
	}).catch(() => loading.value = false);
} else {
	rsvp.value = session.value;
}

function addGuest() {
	rsvp.value.guests.push({
		name: '',
		status: 0
	});
}

function removeItem(idx) {
  	rsvp.value.guests.splice(idx, 1);
}

async function onSubmit() {
	loading.value = true;
	await API(`rsvp/${rsvp.value.id}`, {
		method: 'PUT',
		body: rsvp
	});
	const guestMsg = rsvp.value.guests[0].name
		? `${rsvp.value.guests[0].name}${rsvp.value.guests.length > 1 ? ` & ${rsvp.value.guests.length - 1} other guest${rsvp.value.guests.length > 2 ? 's' : ''}` : ''}`
		: `${rsvp.value.guests.length} guest${rsvp.value.guests.length > 1 ? 's' : ''}`;
	addToast({
		title: 'RSVP Updated',
		body: adminEdit
			 ? `RSVP for ${guestMsg} successfully updated.`
			 : 'RSVP updated successfully. Thank you!'
	});
	loading.value = false;
	Router.push({ name: adminEdit ? 'Admin List RSVPs' : 'Home' });
}
</script>

<template>
	<form class="card-body" @submit.prevent="onSubmit">
		<h5 class="card-title d-flex justify-content-between">
			{{ adminEdit ? 'Edit' : 'Update' }} RSVP
		</h5>
		<div v-for="(guest, idx) in rsvp.guests" :key="idx" class="mb-3">
			<hr>
			<form-input v-model="guest.name" label="Name" :name="`guest-${idx}-name`">
				<template v-if="idx && session.admin" #after>
					<button type="button" class="btn btn-danger" @click="removeItem(idx)">
						Remove
					</button>
				</template>
			</form-input>
			<form-input
				v-model="guest.status"
				label="Status"
				:name="`guest-${idx}-status`"
				type="number"
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
