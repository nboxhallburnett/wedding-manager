<script setup>
import { inject, ref, nextTick, useTemplateRef } from 'vue';
import Router from 'router';

import FormInput from 'components/form/FormInput.vue';
import FormSelect from 'components/form/FormSelect.vue';
import FormArray from 'components/form/FormArray.vue';
import API from 'lib/api';

const session = inject('invitation');
const addToast = inject('addToast');
const loading = inject('loading');
const invitation = ref({});
const songList = useTemplateRef('songList');

// Define available attendance status'
const statusOptions = [
	{ text: 'Attending', value: 1 },
	{ text: 'Tentative', value: 2 },
	{ text: 'Not Attending', value: 3 }
];
if (session.value.admin) {
	statusOptions.unshift({ text: 'Pending', value: 0 });
}

// Define var to track whether the component is used for the admin edit vs the user edit
const adminEdit = Router.currentRoute.value.name === 'Admin Edit Invitation';

// If this is the admin edit, fetch the invitation from the API
if (adminEdit) {
	loading.value = true;
	API(`invitation/${Router.currentRoute.value.params.invitationId}`).then(({ result }) => {
		invitation.value = result.data;
		if (!invitation.value.songs?.length) {
			invitation.value.songs = [ '' ];
		}
		loading.value = false;
	}).catch(() => loading.value = false);
} else {
	// Otherwise, we can use the session
	invitation.value = session.value;
	if (!invitation.value.songs?.length) {
		invitation.value.songs = [ '' ];
	}
}

function addGuest() {
	invitation.value.guests.push({
		name: '',
		status: 0
	});
}
function removeGuest(idx) {
	invitation.value.guests.splice(idx, 1);
}

function addSong() {
	invitation.value.songs.push('');
	nextTick(() => {
		songList.value?.$items?.[invitation.value.songs.length - 1]?.focus();
	});
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
					<button type="button" class="btn btn-danger" @click="removeGuest(idx)">
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
		<button
			v-if="session.admin"
			class="btn btn-primary"
			type="button"
			@click="addGuest"
		>
			Add +1
		</button>
		<hr>
		<form-array
			ref="songList"
			v-model="invitation.songs"
			name="song-suggestions"
			label="Song Suggestions"
			placeholder="Rick Astley - Never Gonna Give You Up"
		>
			<template #after>
				<button
					class="btn btn-primary"
					:class="{ disabled: invitation.songs?.length === 5 }"
					:disabled="invitation.songs?.length === 5"
					type="button"
					@click="addSong"
				>
					Add Suggestion
				</button>
			</template>
		</form-array>
		<button class="btn btn-primary w-100 mt-3" type="submit">
			Submit
		</button>
	</form>
</template>
