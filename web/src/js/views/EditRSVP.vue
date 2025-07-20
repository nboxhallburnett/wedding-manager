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

/** @type {Ref<Invitation>} */
const session = inject('invitation');
/** @type {AddToast} */
const addToast = inject('addToast');
/** @type {Ref<Boolean>} */
const loading = inject('loading');
/** @type {Ref<Invitation>} */
const invitation = ref({});
/** @type {Ref<MenuItem[]>} */
const menu = ref([]);
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
		status_ceremony: 0,
		status_reception: 0,
	});
}
function removeGuest(idx) {
	invitation.value.guests.splice(idx, 1);
}
function addChild() {
	invitation.value.children.push({
		name: ''
	});
	nextTick(() => {
		document.getElementById(`child-${invitation.value.children.length - 1}-name`)?.focus();
	});
}
function removeChild(idx) {
	invitation.value.children.splice(idx, 1);
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
	// Ensure we have songs and children arrays to access
	if (!invitation.value.songs?.length) {
		invitation.value.songs = [ '' ];
	}
	if (!invitation.value.guests?.length) {
		invitation.value.guests = [];
	}
	if (!invitation.value.children?.length) {
		invitation.value.children = [];
	}
	loading.value = false;
});
</script>

<template>
	<form class="card-body" @submit.prevent="onSubmit">
		<h4 class="card-title d-flex justify-content-between">
			{{ adminEdit ? 'Edit' : 'Update' }} Invitation
		</h4>

		<hr>

		<div id="guestAccordion" class="accordion">
			<div v-for="(guest, idx) in invitation.guests" :key="idx" class="accordion-item border-0">
				<div class="accordion-header">
					<button
						class="accordion-button px-0 bg-body shadow-none pt-0"
						type="button"
						data-bs-toggle="collapse"
						:data-bs-target="`#guest-accordion-${idx}-content`"
						aria-expanded="true"
						:aria-controls="`guest-accordion-${idx}-content`"
					>
						<h5 class="mb-0 w-100" v-text="guest.name?.trim() || `Guest ${idx + 1}`" />
						<button
							v-if="idx && session.admin"
							type="button"
							class="btn btn-sm btn-danger ms-auto me-2"
							@click="removeGuest(idx)"
							v-text="'Remove'"
						/>
					</button>
				</div>
				<div
					:id="`guest-accordion-${idx}-content`"
					class="accordion-collapse collapse"
					data-bs-parent="#guestAccordion"
					:class="{ show: idx === 0 }"
				>
					<form-input
						v-model="guest.name"
						label="Name"
						:name="`guest-${idx}-name`"
					/>
					<form-select
						v-model="guest.status_ceremony"
						label="Ceremony"
						:options="statusOptions"
						:default-option="0"
						placeholder="Pending Confirmation"
						:name="`guest-${idx}-ceremony`"
					/>
					<form-select
						v-model="guest.status_reception"
						label="Reception"
						:options="statusOptions"
						:default-option="0"
						placeholder="Pending Confirmation"
						:name="`guest-${idx}-reception`"
					/>
					<form-radio
						v-model="guest.starter_id"
						label="Starter"
						:name="`guest-${idx}-starter`"
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
						:name="`guest-${idx}-main`"
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
						:name="`guest-${idx}-dessert`"
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
			</div>
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

		<div id="childAccordion" class="accordion">
			<div v-for="(child, idx) in invitation.children" :key="idx" class="accordion-item border-0">
				<div class="accordion-header">
					<button
						class="accordion-button px-0 bg-body shadow-none pt-0"
						type="button"
						data-bs-toggle="collapse"
						:data-bs-target="`#child-accordion-${idx}-content`"
						aria-expanded="true"
						:aria-controls="`child-accordion-${idx}-content`"
					>
						<h5 class="mb-0 w-100" v-text="child.name?.trim() || `Child ${idx + 1}`" />
						<button
							v-if="true"
							type="button"
							class="btn btn-sm btn-danger ms-auto me-2"
							@click="removeChild(idx)"
							v-text="'Remove'"
						/>
					</button>
				</div>
				<div
					:id="`child-accordion-${idx}-content`"
					class="accordion-collapse collapse show"
					data-bs-parent="#childAccordion"
				>
					<form-input v-model="child.name" label="Name" :name="`child-${idx}-name`" />
					<form-input
						v-model="child.age"
						label="Age"
						type="number"
						min="0"
						max="17"
						:name="`child-${idx}-age`"
					/>
					<form-radio
						v-model="child.starter_id"
						label="Starter"
						:name="`child-${idx}-starter`"
						:options="getMenuOptions(0, true)"
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
						v-model="child.main_id"
						label="Main Course"
						:name="`child-${idx}-main`"
						:options="getMenuOptions(1, true)"
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
						v-model="child.dessert_id"
						label="Dessert"
						:name="`child-${idx}-dessert`"
						:options="getMenuOptions(2, true)"
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
			</div>
		</div>
		<button
			v-if="invitation.children?.length < 5"
			class="btn btn-primary"
			type="button"
			@click="addChild"
		>
			Add Child
		</button>

		<hr>

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
		<form-textarea
			v-model="invitation.message"
			name="message"
			label="Message"
			placeholder="Leave us a message!"
		/>

		<button class="btn btn-primary w-100 mt-3" type="submit">
			Submit
		</button>
	</form>
</template>
