<script setup>
import { inject, ref } from 'vue';
import Router from 'router';

import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';
import FormItem from 'components/form/FormItem.vue';
import FormText from 'components/form/FormText.vue';
import DietIndicator from 'components/DietIndicator.vue';

/** @type {Ref<Boolean>} */
const loading = inject('loading');
/** @type {Ref<MenuItem>} */
const item = ref({});
/** @type {Ref<Invitation[]>} */
const invitations = ref([]);

// Define available course options
const courseOptions = [ 'Starter', 'Main', 'Dessert' ];
const menuOptions = [ 'Adult', 'Children' ];

useLoader([
	`menu/${Router.currentRoute.value.params.menuItemId}`,
	`invitation?menuItemId=${Router.currentRoute.value.params.menuItemId}`
], [ item, invitations ]);

/**
 * Construct a display name for a given invitation record
 *
 * @param {Invitation} invitation
 * @returns {String}
 */
function invitationDisplay(invitation) {
	let out = invitation.guests?.[0].name || '';
	if (invitation.guests?.length > 1) {
		if (out) {
			out += `, ${invitation.guests.length - 1} other guest${invitation.guests.length > 2 ? 's' : ''}`;
		} else {
			out += `${invitation.guests.length} guest${invitation.guests.length > 1 ? 's' : ''}`;
		}
	}
	if (invitation.children?.length) {
		out += `, ${invitation.children.length} children`;
	}
	return out;
}
</script>

<template>
	<card-header title="Menu Item">
		<router-link class="btn btn-link btn-sm me-2" :to="{ name: 'Admin List Menu Items' }">
			Back
		</router-link>
		<router-link class="btn btn-primary btn-sm" :to="{ name: 'Admin Edit Menu Item' }">
			Update Menu Item
		</router-link>
	</card-header>
	<form-item name="title" label="Title">
		<div class="form-control-plaintext">
			<span v-text="item.title" />
			<diet-indicator v-if="!loading" class="ms-2" :item />
		</div>
	</form-item>
	<form-text
		v-model="item.description"
		name="description"
		label="Description"
	/>
	<form-text
		:value="courseOptions[item.course]"
		name="course"
		label="Course"
	/>
	<form-text
		:value="menuOptions[Number(item.child)]"
		name="child"
		label="Menu"
	/>
	<form-item
		name="invitations"
		label="Invitations"
		hint="Invitations in which the menu item is selected"
	>
		<template v-for="invitation in invitations" :key="invitation.id">
			<div class="form-control-plaintext">
				<router-link
					:to="{ name: 'Admin Edit Invitation', params: { invitationId: invitation.id } }"
					class="link-primary font-monospace"
				>
					{{ invitation.id }}
				</router-link>
				({{ invitationDisplay(invitation) }})
			</div>
		</template>
		<div v-if="!invitations.length" class="form-control-plaintext">
			---
		</div>
	</form-item>
</template>
