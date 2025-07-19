<script setup>
import { inject, ref, nextTick, useTemplateRef } from 'vue';
import Router from 'router';

import DietIndicator from 'components/DietIndicator.vue';
import FormArray from 'components/form/FormArray.vue';
import FormInput from 'components/form/FormInput.vue';
import FormRadio from 'components/form/FormRadio.vue';
import FormSelect from 'components/form/FormSelect.vue';
import FormTextarea from 'components/form/FormTextarea.vue';
import API from 'lib/api';


const session = inject('invitation');
const addToast = inject('addToast');
const loading = inject('loading');
const invitation = ref({});
const menu = ref({});
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

function getMenuOptions(course, child) {
	const items = [];
	for (const item of menu.value) {
		// Unfortunately inly children can have items from the children's menu
		if (item.child && !child) {
			continue;
		}
		// If the item is for the requested course, add it to the list
		if (item.course === course) {
			items.push({ value: item.id, text: item.title, item });
		}
	}
	return items;
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

loading.value = true;
Promise.all([
	// If this is the admin edit, fetch the invitation from the API, otherwise we can use the session
	adminEdit ? API(`invitation/${Router.currentRoute.value.params.invitationId}`) : { result: { data: session.value } },
	API('menu')
]).then(([ invitationResult, menuResult ]) => {
	invitation.value = invitationResult.result.data;
	menu.value = menuResult.result.data;
	// Ensure we have a songs array to access
	if (!invitation.value.songs?.length) {
		invitation.value.songs = [ '' ];
	}
	loading.value = false;
});
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
			<form-radio
				v-model="guest.starter_id"
				label="Starter"
				name="starter"
				:options="getMenuOptions(0, false)"
			>
				<template #after-each="{ item }">
					<diet-indicator
						class="ms-2 align-top"
						:vegan="item.vegan"
						:vegetarian="item.vegetarian"
						:gluten-free="item.gluten_free"
					/>
					<small class="d-block text-muted" v-text="item.description" />
				</template>
			</form-radio>
			<form-radio
				v-model="guest.main_id"
				label="Main Course"
				name="main"
				:options="getMenuOptions(1, false)"
			>
				<template #after-each="{ item }">
					<diet-indicator
						class="ms-2 align-top"
						:vegan="item.vegan"
						:vegetarian="item.vegetarian"
						:gluten-free="item.gluten_free"
					/>
					<small class="d-block text-muted" v-text="item.description" />
				</template>
			</form-radio>
			<form-radio
				v-model="guest.dessert_id"
				label="Dessert"
				name="dessert"
				:options="getMenuOptions(2, false)"
			>
				<template #after-each="{ item }">
					<diet-indicator
						class="ms-2 align-top"
						:vegan="item.vegan"
						:vegetarian="item.vegetarian"
						:gluten-free="item.gluten_free"
					/>
					<small class="d-block text-muted" v-text="item.description" />
				</template>
			</form-radio>
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
		<form-textarea
			v-model="invitation.message"
			name="message"
			label="Message"
			placeholder="Leave us a message!"
		/>
		<form-array
			ref="songList"
			v-model="invitation.songs"
			name="song-suggestions"
			label="Song Suggestions"
			hint="Suggest songs you would like to hear play during the reception"
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
