<script setup>
import { inject, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { useForm } from 'composables/form';
import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';
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

const tableOpts = {
	caption: 'Feedback Item',
	columns: [
		{ id: 'invitation', text: 'Invitation' },
		{ id: 'created', text: 'Created' },
		{ id: 'message', text: 'Message' }
	],
	actions(item) {
		if (!item.id) {
			return [];
		}
		return [
			{ text: 'Delete', onClick: () => deleteItem(item), class: 'text-danger' }
		];
	}
};
</script>

<template>
	<card-header title="Feedback" />
	<div class="card-text">
		<table-component v-slot="{ item }" :items="items" v-bind="tableOpts">
			<th scope="row">
				<router-link :to="{ name: 'Admin Edit Invitation', params: { invitationId: item.invitation } }">
					{{ item.invitation }}
				</router-link>
			</th>
			<td v-text="new Date(item.created).toLocaleString()" />
			<td v-text="item.message" />
		</table-component>
	</div>
</template>
