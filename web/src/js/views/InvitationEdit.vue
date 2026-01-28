<script setup>
import { inject, ref, nextTick, useTemplateRef, watch, onMounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import Collapse from 'bootstrap/js/dist/collapse';
import Modal from 'bootstrap/js/dist/modal';
import Router from 'router';

import { useForm } from 'composables/form';
import { useLoader } from 'composables/loader';

import CardBody from 'components/CardBody.vue';
import DietIndicator from 'components/DietIndicator.vue';
import InfoPopover from 'components/InfoPopover.vue';
import FormArray from 'components/form/FormArray.vue';
import FormInput from 'components/form/FormInput.vue';
import FormRadio from 'components/form/FormRadio.vue';
import FormSelect from 'components/form/FormSelect.vue';
import FormText from 'components/form/FormText.vue';
import FormTextarea from 'components/form/FormTextarea.vue';

/** @type {Ref<Invitation>} */
const session = inject('invitation');

/** @type {AddToast} */
const addToast = inject('addToast');

/** @type {Ref<Invitation>} */
const invitation = ref({});
const initialValue = ref(null);

/** @type {Ref<MenuItem[]>} */
const menu = ref([]);

const songList = useTemplateRef('songList');
const guestCollapses = ref([]);

const $modal = useTemplateRef('modal');
const navWarningModal = ref(null);
const guardModalResolve = ref(null);

// Define available attendance status'
const statusOptions = [
	{ text: 'Attending', value: 1 },
	{ text: 'Tentative', value: 2 },
	{ text: 'Not Attending', value: 3 }
];
if (session.value.admin) {
	statusOptions.unshift({ text: 'Pending', value: 0 });
}

// Define a map of the different menu items to be captured on the form
const mealsMap = [
	{ text: 'Starter', key: 'starter_id' },
	{ text: 'Main Course', key: 'main_id' },
	{ text: 'Dessert', key: 'dessert_id' }
];

// Define var to track whether the component is used for the admin edit vs the user edit
const adminEdit = Router.currentRoute.value.name === 'Admin Edit Invitation';

const { onSubmit } = useForm({
	path: () => `invitation/${invitation.value.id}`,
	method: 'PUT',
	body: invitation,
	validation: true,
	onSuccess() {
		const guestMsg = invitation.value.guests[0].name
			? `${invitation.value.guests[0].name}${invitation.value.guests.length > 1 ? ` & ${invitation.value.guests.length - 1} other guest${invitation.value.guests.length > 2 ? 's' : ''}` : ''}`
			: `${invitation.value.guests.length} guest${invitation.value.guests.length > 1 ? 's' : ''}`;
		addToast({
			title: 'Invitation Updated',
			body: adminEdit
				? `Invitation for "${guestMsg}" successfully updated.`
				: 'Invitation updated successfully. Thank you!'
		});
		// If this is the invitee updating their RSVP then update the session with their changes
		if (!adminEdit) {
			session.value = invitation.value;
		}
		// Update the stored initial value so the navigation guard doesn't falsely prompt for unsaved changes
		initialValue.value = JSON.stringify(invitation.value);
		Router.push({ name: adminEdit ? 'Admin List Invitations' : 'Home' });
	},
	onError(data) {
		addToast({
			title: 'Error Updating Invitation',
			body: data.description
		});
	}
});

// Fetch the required data for the form
useLoader([
	// If this is the admin edit, fetch the invitation from the API, otherwise we can use a clone of the session
	adminEdit ? `invitation/${Router.currentRoute.value.params.invitationId}` : { result: { data: JSON.parse(JSON.stringify(session.value)) } },
	'menu'
], ([ invitationResult, menuResult ]) => {
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
	for (const guest of invitation.value.guests) {
		if (!guest.name) {
			guest.name = '';
		}
		if (!guest.diet) {
			guest.diet = '';
		}
	}

	// Track the initial value of the form to determine if there were any modifications in the exit guard
	initialValue.value = JSON.stringify(invitation.value);

	nextTick(() => {
		guestCollapses.value = [];
		for (let i = 0; i < invitation.value.guests.length; i++) {
			const collapse = new Collapse(`#guest-${i}-collapse`, {
				toggle: Boolean(invitation.value.guests[i]?.name)
			});
			guestCollapses.value.push(collapse);
		}
	});
});

// Watch for names being defined for each of the guests to determine whether to show the rest of their forms
watch(() => invitation.value.guests?.map(g => Boolean(g.name)), (nameExists, prev) => {
	if (!nameExists || !prev || nameExists?.length !== prev?.length) {
		return;
	}
	for (let i = 0; i < nameExists.length; i++) {
		if (nameExists[i] && !prev[i]) {
			guestCollapses.value[i].show();
		} else if (!nameExists[i] && prev[i]) {
			guestCollapses.value[i].hide();
		}
	}
});

onMounted(() => {
	// Instantiate the navigation guard warning modal when the DOM is loaded with the page content
	navWarningModal.value = new Modal($modal.value, { backdrop: false });
});

onBeforeRouteLeave(async () => {
	// If the form content is unchanged from initial load, continue on our way
	if (initialValue.value === JSON.stringify(invitation.value)) {
		return true;
	}

	// The form has unsaved changes, so show the warning modal
	navWarningModal.value.show();

	// Wait for the modal to either be dismissed or navigation is confirmed
	const result = await new Promise(resolve => {
		guardModalResolve.value = resolve;
		$modal.value.addEventListener('hidden.bs.modal', () => resolve(false), { once: true });
	});

	// Unset the resolve promise
	guardModalResolve.value = null;

	// And return based on whether stay or leave was selected
	return result;
});

/**
 * Add a new guest to the invitation
 */
function addGuest() {
	// Add a base guest definition to the array
	invitation.value.guests.push({
		name: '',
		status_ceremony: 0,
		status_reception: 0
	});

	// Once the new guest's entry has been added to the DOM...
	nextTick(() => {
		// Define the collapse instance for its content
		const collapse = new Collapse(`#guest-${invitation.value.guests.length - 1}-collapse`, { toggle: false });
		guestCollapses.value.push(collapse);

		// Toggle the new guest's accordion open
		const $guestContainer = document.getElementById('guest-accordion');
		$guestContainer.querySelector(`[data-bs-target="#guest-accordion-${invitation.value.guests.length - 1}-content"]`).click();
		nextTick(() => {
			// And focus their name input
			document.getElementById(`guest-${invitation.value.guests.length - 1}-name`)?.focus();
		});
	});
}
/**
 * Remove a guest from the invitation
 *
 * @param {Number} idx Index of the guest to remove
 */
function removeGuest(idx) {
	guestCollapses.value[idx]?.dispose();
	guestCollapses.value.splice(idx, 1);
	invitation.value.guests.splice(idx, 1);
}

/**
 * Add a child to the invitation
 */
function addChild() {
	// Add a base child definition to the array
	invitation.value.children.push({
		name: ''
	});

	// Once the new child's entry has been added to the DOM...
	nextTick(() => {
		// Toggle the child's accordion open
		const $childrenContainer = document.getElementById('child-accordion');
		$childrenContainer.querySelector(`[data-bs-target="#child-accordion-${invitation.value.children.length - 1}-content"]`).click();
		nextTick(() => {
			// And focus their name input
			document.getElementById(`child-${invitation.value.children.length - 1}-name`)?.focus();
		});
	});
}
/**
 * Remove a child from the invitation
 *
 * @param {Number} idx Index of the child to remove
 */
function removeChild(idx) {
	invitation.value.children.splice(idx, 1);
}

/**
 * Add a new item to the invitation's song capture array
 */
function addSong() {
	invitation.value.songs.push('');
	nextTick(() => {
		songList.value?.$items?.[invitation.value.songs.length - 1]?.focus();
	});
}

/**
 * Build the set of available menu items for a given course and guest type
 *
 * @param {0|1|2} course Course of the menu items to return
 * @param {Boolean} child Whether to include items from the children's menu
 */
function getMenuOptions(course, child) {
	const items = [];
	// Loop through the set of fetched menu items
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
	// Add the 'Other' option at the end of the list
	items.push({
		value: 'other',
		text: 'Other',
		item: {
			description: 'If you have specific dietary requirements not covered by the available menu options, please let us know below.'
		}
	});
	return items;
}
</script>

<template>
	<card-body :title="adminEdit ? 'Edit Invitation' : 'Manage RSVP'" :back="{ name: adminEdit ? 'Admin View Invitation' : 'Home' }" :on-submit>
		<form class="card-text needs-validation" novalidate @submit.prevent.stop="onSubmit">
			<form-text
				v-if="adminEdit"
				v-model="invitation.id"
				name="id"
				label="ID"
				text-class="font-monospace"
			/>

			<div id="guest-accordion" class="accordion">
				<div v-for="(guest, idx) in invitation.guests" :key="idx" class="accordion-item border-0">
					<div class="accordion-header">
						<button
							class="accordion-button px-0 bg-body shadow-none pt-0"
							type="button"
							data-bs-toggle="collapse"
							aria-expanded="true"
							:class="{ collapsed: idx !== 0 }"
							:data-bs-target="`#guest-accordion-${idx}-content`"
							:aria-controls="`guest-accordion-${idx}-content`"
						>
							<h5 class="mb-0 w-100" v-text="guest.name?.trim() || (idx ? '+1' : `Guest ${idx + 1}`)" />
							<button
								v-if="idx && session.admin"
								type="button"
								class="btn btn-sm btn-danger ms-auto me-2"
								v-text="'Remove'"
								@click="removeGuest(idx)"
							/>
						</button>
					</div>
					<div
						:id="`guest-accordion-${idx}-content`"
						class="accordion-collapse collapse"
						data-bs-parent="#guest-accordion"
						:class="{ show: idx === 0 }"
					>
						<form-input v-model="guest.name" label="Name" :name="`guest-${idx}-name`" />
						<span :id="`guest-${idx}-collapse`" class="collapse">
							<form-select
								v-model="guest.status_ceremony"
								label="Ceremony"
								placeholder="Pending Confirmation"
								:options="statusOptions"
								:default-option="0"
								:name="`guest-${idx}-ceremony`"
							/>
							<form-select
								v-model="guest.status_reception"
								label="Reception"
								placeholder="Pending Confirmation"
								:options="statusOptions"
								:default-option="0"
								:name="`guest-${idx}-reception`"
							/>
							<template v-if="[ 1, 2 ].includes(guest.status_ceremony)">
								<template v-for="(meal, mealIdx) in mealsMap" :key="`guest-${idx}-${mealIdx}`">
									<hr>
									<form-radio
										v-model="guest[meal.key]"
										:label="meal.text"
										:name="`guest-${idx}-${meal.key}`"
										:options="getMenuOptions(mealIdx, false)"
									>
										<template #after-each="{ item }">
											<diet-indicator class="ms-2 align-top" :item />
											<small class="d-block text-muted" v-text="item.description" />
										</template>
									</form-radio>
								</template>
								<hr>
								<form-textarea
									v-model="guest.diet"
									label="Dietary Requirement"
									hint="Please let us know of any dietary requirements not covered by the menu and we will be in contact to provide you with additional meal options."
									placeholder="Allergies, health conditions, ethical choices, etc."
									validation="Please let us know what dietary requirements you have so we can contact you with the available meal options"
									:name="`guest-${idx}-diet`"
									:required="guest.name && [ guest.starter_id, guest.main_id, guest.dessert_id ].includes('other') || undefined"
								/>
							</template>
							<hr>
						</span>
					</div>
				</div>
			</div>
			<button
				v-if="session.admin"
				class="btn btn-primary"
				type="button"
				v-text="'Add +1'"
				@click="addGuest"
			/>

			<hr>

			<div id="child-accordion" class="accordion">
				<h5 class="mb-3">
					Children
					<info-popover hint="Even if your child is young enough to not require a meal, please still let us know so we can accommodate them at the table." />
				</h5>
				<div v-for="(child, idx) in invitation.children" :key="idx" class="accordion-item border-0">
					<div class="accordion-header">
						<button
							class="accordion-button px-0 bg-body shadow-none pt-0 collapsed"
							type="button"
							data-bs-toggle="collapse"
							aria-expanded="true"
							:data-bs-target="`#child-accordion-${idx}-content`"
							:aria-controls="`child-accordion-${idx}-content`"
						>
							<h5 class="mb-0 w-100" v-text="child.name?.trim() || `Child ${idx + 1}`" />
							<button
								v-if="true"
								type="button"
								class="btn btn-sm btn-danger ms-auto me-2"
								v-text="'Remove'"
								@click="removeChild(idx)"
							/>
						</button>
					</div>
					<div
						:id="`child-accordion-${idx}-content`"
						class="accordion-collapse collapse"
						data-bs-parent="#child-accordion"
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
						<template v-if="child.age">
							<form-radio
								v-for="(meal, mealIdx) in mealsMap"
								:key="`child-${idx}-${mealIdx}`"
								v-model="child[meal.key]"
								:label="meal.text"
								:name="`child-${idx}-${meal.key}`"
								:options="getMenuOptions(mealIdx, child.age <= 12)"
							>
								<template #after-each="{ item }">
									<diet-indicator class="ms-2 align-top" :item />
									<small class="d-block text-muted" v-text="item.description" />
								</template>
							</form-radio>
							<form-textarea
								v-model="child.diet"
								name="diet"
								label="Dietary Requirement"
								hint="Please let us know of any dietary requirements not covered by the menu and we will be in contact to provide you with additional meal options."
								placeholder="Allergies, health conditions, ethical choices, etc."
								:required="child.name && [ child.starter_id, child.main_id, child.dessert_id ].includes('other') || undefined"
								validation
							/>
						</template>
					</div>
				</div>
			</div>
			<button
				v-if="invitation.children?.length < 5"
				class="btn btn-primary"
				type="button"
				v-text="'Add Child'"
				@click="addChild"
			/>

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
						type="button"
						:class="{ disabled: invitation.songs?.length === 5, 'mt-2': invitation.songs?.length }"
						:disabled="invitation.songs?.length === 5"
						v-text="'Add Suggestion'"
						@click="addSong"
					/>
				</template>
			</form-array>
			<hr>
			<form-textarea
				v-model="invitation.message"
				name="message"
				label="Message"
				placeholder="Leave us a message!"
			/>
		</form>

		<teleport to="body">
			<div
				ref="modal"
				class="modal fade"
				tabindex="-1"
				aria-hidden="true"
			>
				<div class="modal-dialog pt-5">
					<div class="modal-content">
						<div class="modal-header border-0">
							<h5 class="modal-title">
								You Have Unsaved Changes
							</h5>
							<button
								type="button"
								class="btn-close"
								data-bs-dismiss="modal"
								aria-label="Close"
							/>
						</div>
						<div class="modal-body">
							<div id="modal-content">
								Are you sure you want to leave the page?
							</div>
						</div>
						<div class="modal-footer border-0">
							<button type="button" class="btn btn-link" data-bs-dismiss="modal">
								Stay
							</button>
							<button
								type="button"
								class="btn btn-primary"
								data-bs-dismiss="modal"
								@click="() => guardModalResolve(true)"
							>
								Leave
							</button>
						</div>
					</div>
				</div>
			</div>
		</teleport>
	</card-body>
</template>
