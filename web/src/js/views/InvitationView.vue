<script setup>
import { inject, ref } from 'vue';
import Router from 'router';

import API from 'lib/api';
import { useLoader } from 'composables/loader';
import { statusMessages } from 'lib/formatter';

import CardBody from 'components/CardBody.vue';
import CardHeader from 'components/CardHeader.vue';
import DietIndicator from 'components/DietIndicator.vue';
import FormText from 'components/form/FormText.vue';
import FormItem from 'components/form/FormItem.vue';

// Define var to track whether the component is used for the admin edit vs the user edit
const adminView = Router.currentRoute.value.name === 'Admin View Invitation';

// Define a map of the different menu items to be displayed on the view
const mealsMap = [
	{ text: 'Starter', key: 'starter_id' },
	{ text: 'Main Course', key: 'main_id' },
	{ text: 'Dessert', key: 'dessert_id' }
];

/** @type {Ref<Invitation>} */
const session = inject('invitation');
/** @type {Ref<Invitation>} */
const invitation = ref({});

const menuItems = ref([]);

// If this is the admin view, fetch the invitation from the API, otherwise we can use the session
useLoader(adminView ? `invitation/${Router.currentRoute.value.params.invitationId}` : { result: { data: session.value } }, async response => {
	invitation.value = response.result.data;

	// Once the invitation is loaded, fetch any selected menu items from the API
	const menuItemIds = new Set();
	// Loop through each guest and child to get a set of unique meal IDs
	for (const invitee of (invitation.value.guests || []).concat(invitation.value.children || [])) {
		// Bypass adding if the invitee has no name set
		if (!invitee.name) {
			continue;
		}
		// Add any starter, main course, and dessert ID values other than "other"
		if (invitee.starter_id && invitee.starter_id !== 'other') {
			menuItemIds.add(invitee.starter_id);
		}
		if (invitee.main_id && invitee.main_id !== 'other') {
			menuItemIds.add(invitee.main_id);
		}
		if (invitee.dessert_id && invitee.dessert_id !== 'other') {
			menuItemIds.add(invitee.dessert_id);
		}
	}
	// If there are no selected menu items, there's nothing we need to fetch
	if (!menuItemIds.size) {
		return;
	}
	// Build a query string from the set of IDs
	const qs = Array.from(menuItemIds).map(id => `id=${id}`).join('&');
	// Request the menu items filtered by the selected IDs
	const menuRequest = await API(`menu?${qs}`);
	// And convert the returned items into an object keyed by their ID, defaulted with "other"
	menuItems.value = menuRequest.result.data.reduce((items, item) => {
		items[item.id] = item;
		return items;
	}, { other: 'Other' });
});
</script>

<template>
	<component :is="adminView ? CardBody : 'div'">
		<card-header
			title="Invitation"
			:back="adminView ? { name: 'Admin List Invitations' } : undefined"
			:action="adminView
				? { text: 'Edit Invitation', to: { name: 'Admin Edit Invitation' } }
				: !invitation.admin
					? { text: 'Manage RSVP', to: { name: 'Edit Invitation' } }
					: undefined"
		/>
		<div class="card-text">
			<template v-if="invitation?.guests?.length">
				<div v-for="(guest, idx) in invitation.guests" :key="idx" class="mb-3">
					<template v-if="guest.name">
						<hr v-if="idx">
						<form-text v-model="guest.name" label="Name" :name="`guest-${idx}-name`" />
						<form-text
							:value="statusMessages[guest.status_ceremony]"
							label="Ceremony Attendance"
							:options="statusMessages"
							:name="`guest-${idx}-ceremony`"
						/>
						<form-text
							:value="statusMessages[guest.status_reception]"
							label="Reception Attendance"
							:options="statusMessages"
							:name="`guest-${idx}-reception`"
						/>
						<template v-for="(meal, mealIdx) in mealsMap" :key="`guest-${idx}-${mealIdx}`">
							<form-item v-if="guest[meal.key] && [ 1, 2 ].includes(guest.status_ceremony)" :name="`guest-${idx}-${meal.key}`" :label="meal.text">
								<div v-if="menuItems[guest[meal.key]]" class="form-control-plaintext">
									<span v-text="menuItems[guest[meal.key]].title" />
									<diet-indicator class="ms-2" :item="menuItems[guest[meal.key]]" />
								</div>
								<div v-else class="form-control-plaintext placeholder-wave">
									<span class="placeholder rounded-1" :class="[ 'w-33', 'w-50', 'w-25' ][mealIdx]" />
								</div>
							</form-item>
						</template>
					</template>
				</div>
				<hr>
			</template>
			<template v-if="invitation?.children?.length">
				<h5 class="mb-3" v-text="'Children'" />
				<div class="card-text">
					<div v-for="(child, idx) in invitation.children" :key="idx" class="mb-3">
						<template v-if="child.name">
							<hr v-if="idx">
							<form-text v-model="child.name" label="Name" :name="`child-${idx}-name`" />
							<form-text v-model="child.age" label="Age" :name="`child-${idx}-age`" />
							<template v-for="(meal, mealIdx) in mealsMap" :key="`child-${idx}-${mealIdx}`">
								<form-item v-if="child[meal.key]" :name="`child-${idx}-${meal.key}`" :label="meal.text">
									<div v-if="menuItems[child[meal.key]]" class="form-control-plaintext">
										<span v-text="menuItems[child[meal.key]].title" />
										<diet-indicator class="ms-2" :item="menuItems[child[meal.key]]" />
									</div>
									<div v-else class="form-control-plaintext placeholder-wave">
										<span class="placeholder rounded-1" :class="[ 'w-33', 'w-50', 'w-25' ][mealIdx]" />
									</div>
								</form-item>
							</template>
						</template>
					</div>
				</div>
				<hr>
			</template>
			<form-text
				v-if="invitation?.message"
				v-model="invitation.message"
				label="Message"
				name="message"
			/>
			<form-text
				v-if="invitation?.songs?.filter(Boolean).length"
				v-model="invitation.songs"
				label="Song Suggestions"
				name="songs"
			/>
		</div>
	</component>
</template>
