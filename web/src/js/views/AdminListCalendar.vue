<script setup>
import { inject, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { useForm } from 'composables/form';
import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';

import { formatDate } from 'lib/formatter';

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
</script>

<template>
	<div class="card-body">
		<card-header title="Calendar Events" :action="{ text: 'New Item', to: { name: 'Admin Create Calendar Event' } }" />
		<div class="card-text">
			<table class="table table-hover mt-1">
				<thead>
					<tr>
						<th scope="col">
							Summary
						</th>
						<th scope="col">
							When
						</th>
						<th scope="col" class="text-end">
							Actions
						</th>
					</tr>
				</thead>
				<tbody>
					<template v-for="item in events" :key="item.id">
						<tr>
							<th scope="row">
								<router-link :to="{ name: 'Admin View Calendar Event', params: { calendarEventId: item.id } }">
									{{ item.summary }}
								</router-link>
							</th>
							<td v-text="formatDate(item)" />
							<td class="text-end py-1 align-middle">
								<button
									:id="`menu-item-${item.id}-actions`"
									class="icon-caret fs-4 p-0"
									type="button"
									data-bs-toggle="dropdown"
									aria-expanded="false"
								/>
								<ul class="dropdown-menu" :aria-labelledby="`menu-item-${item.id}-actions`">
									<li>
										<router-link class="dropdown-item" :to="{ name: 'Admin View Calendar Event', params: { calendarEventId: item.id } }">
											View
										</router-link>
									</li>
									<li>
										<router-link class="dropdown-item" :to="{ name: 'Admin Edit Calendar Event', params: { calendarEventId: item.id } }">
											Edit
										</router-link>
									</li>
									<li><hr class="dropdown-divider"></li>
									<li>
										<button class="dropdown-item text-danger" type="button" @click="deleteEvent(item)">
											Delete
										</button>
									</li>
								</ul>
							</td>
						</tr>
					</template>
				</tbody>
			</table>
		</div>
	</div>
</template>
