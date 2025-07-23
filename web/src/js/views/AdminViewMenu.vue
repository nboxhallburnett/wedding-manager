<script setup>
import { inject, ref } from 'vue';
import Router from 'router';

import CardHeader from 'components/CardHeader.vue';
import FormItem from 'components/form/FormItem.vue';
import FormText from 'components/form/FormText.vue';
import DietIndicator from 'components/DietIndicator.vue';
import API from 'lib/api';

/** @type {Ref<Boolean>} */
const loading = inject('loading');
/** @type {Ref<MenuItem>} */
const item = ref({});

const invitationsLoading = ref(true);

/** @type {Ref<Invitation[]>} */
const invitations = ref([]);

// Define available course options
const courseOptions = [ 'Starter', 'Main', 'Dessert' ];
const menuOptions = [ 'Adult', 'Children' ];

loading.value = true;
API(`menu/${Router.currentRoute.value.params.menuItemId}`).then(({ result }) => {
	item.value = result.data;
	loading.value = false;
}).catch(() => loading.value = false);

API(`invitation?menuItemId=${Router.currentRoute.value.params.menuItemId}`).then(({ result }) => {
	invitations.value = result.data;
	invitationsLoading.value = false;
}).catch(() => invitationsLoading.value = false);

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
	<div class="card-body">
		<card-header title="Menu Item" :action="{ text: 'Update Menu Item', to: { name: 'Admin Edit Menu Item', params: $route.params } }" />
		<form-item name="title" label="Title">
			<div class="form-control-plaintext">
				<span v-text="item.title" />
				<diet-indicator
					v-if="!loading"
					class="ms-2"
					:vegan="item.vegan"
					:vegetarian="item.vegetarian"
					:gluten-free="item.gluten_free"
				/>
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
			v-if="!invitationsLoading"
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
		</form-item>
	</div>
</template>
