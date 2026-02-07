<script setup>
import { inject, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { useForm } from 'composables/form';
import { useLoader } from 'composables/loader';

import CardBody from 'components/CardBody.vue';
import TableComponent from 'components/TableComponent.vue';

import { formatEventDate } from 'lib/formatter.js';

/** @type {Ref<CalendarEvent[]>} */
const events = ref([]);

/** @type {AddToast} */
const addToast = inject('addToast');

// Fetch the list of events
useLoader('calendar', events);

const { onSubmit: deleteEvent } = useForm({
	method: 'DELETE',
	path: event => `calendar/${event.id}`,
	onSuccess(_data, _response, event) {
		addToast({
			title: 'Calendar Event Removed',
			body: `Calendar event "${event.summary}" (${event.id}) successfully removed.`
		});
		// Refetch the events for the table
		useLoader('calendar', events);
	}
});

const tableOpts = {
	caption: 'Calendar Event',
	columns: [
		{ id: 'summary', text: 'Summary' },
		{ id: 'when', text: 'When' }
	],
	actions(item) {
		if (!item.id) {
			return [];
		}
		return [
			{ text: 'View', to: { name: 'Admin View Calendar Event', params: { calendarEventId: item.id } } },
			{ text: 'Edit', to: { name: 'Admin Edit Calendar Event', params: { calendarEventId: item.id } } },
			{ divider: true },
			{ text: 'Delete', onClick: () => deleteEvent(item), class: 'text-danger' }
		];
	}
};
</script>

<template>
	<card-body title="Calendar Events" :back="{ name: 'Admin Overview' }" :action="{ text: 'New Item', to: { name: 'Admin Create Calendar Event' } }">
		<div class="card-text">
			<table-component v-slot="{ item }" :items="events" v-bind="tableOpts">
				<th scope="row">
					<router-link :to="{ name: 'Admin View Calendar Event', params: { calendarEventId: item.id } }">
						{{ item.summary }}
					</router-link>
				</th>
				<td v-text="formatEventDate(item)" />
			</table-component>
		</div>
	</card-body>
</template>
