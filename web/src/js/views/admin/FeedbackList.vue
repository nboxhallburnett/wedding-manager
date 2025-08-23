<script setup>
import { inject, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { useForm } from 'composables/form';
import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';
import RelativeDate from 'components/RelativeDate.vue';
import TableComponent from 'components/TableComponent.vue';

/** @type {Ref<FeedbackItem[]>} */
const items = ref([]);

/** @type {AddToast} */
const addToast = inject('addToast');

// Fetch the list of events
useLoader('feedback', items);

const { onSubmit: deleteItem } = useForm({
	method: 'DELETE',
	path: feedback => `feedback/${feedback.id}`,
	onSuccess(_data, _response, feedback) {
		addToast({
			title: 'Feedback Removed',
			body: `Feedback item "${feedback.id}" successfully removed.`
		});
		// Refetch the events for the table
		useLoader('feedback', items);
	}
});
const { onSubmit: updateItem } = useForm({
	method: 'PUT',
	path: feedback => `feedback/${feedback.id}`,
	body(item) {
		return { read: !item.read };
	},
	onSuccess(_data, _response, feedback) {
		addToast({
			title: 'Feedback Updated',
			body: `Feedback item "${feedback.id}" successfully updated.`
		});
		// Refetch the events for the table
		useLoader('feedback', items);
	}
});

const tableOpts = {
	caption: 'Feedback Item',
	columns: [
		{ id: 'invitation', text: 'Invitation' },
		{ id: 'read', text: 'Read' },
		{ id: 'created', text: 'Created' },
		{ id: 'message', text: 'Message' }
	],
	rowClass(item) {
		if (!item.read) {
			return 'table-warning';
		}
		return '';
	},
	search(item, term) {
		// Match on the feedback ID
		if (item.id === term) {
			return true;
		}
		// On the corresponding invitation ID
		if (item.invitation === term) {
			return true;
		}
		// Or if the message case-insensitively matches the term
		if (item.message.toLowerCase().includes(term.toLowerCase())) {
			return true;
		}
		// Otherwise, no match
		return false;
	},
	actions(item) {
		// If the item is invalid (somehow), fall out with no actions
		if (!item.id || !item.message) {
			return [];
		}

		// Default the list of actions to just the divider and the delete option
		const items = [
			{ divider: true },
			{ text: 'Delete', onClick: () => deleteItem(item), class: 'text-danger' }
		];

		// Add either the mark read or unread actions depending on the items current state
		if (item.read) {
			items.unshift({ text: 'Mark Unread', onClick: () => updateItem(item) });
		} else {
			items.unshift({ text: 'Mark Read', onClick: () => updateItem(item) });
		}

		return items;
	}
};
</script>

<template>
	<card-header title="Feedback" :back="{ name: 'Admin Overview' }" />
	<div class="card-text">
		<table-component v-slot="{ item }" :items="items" v-bind="tableOpts">
			<th scope="row">
				<router-link :to="{ name: 'Admin Edit Invitation', params: { invitationId: item.invitation } }" :class="!item.read ? 'link-warning' : ''">
					{{ item.invitation }}
				</router-link>
			</th>
			<td v-text="item.read ? 'Read' : 'Unread'" />
			<td>
				<relative-date :date="item.created" />
			</td>
			<td v-text="item.message" />
		</table-component>
	</div>
</template>
