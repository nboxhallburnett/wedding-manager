<script setup>
import { inject, ref } from 'vue';
import { RouterLink } from 'vue-router';

import API from 'lib/api';
import { formatDate } from 'lib/formatter';

/** @type {Ref<CalendarEvent[]>} */
const events = ref([]);
/** @type {Ref<Boolean>} */
const loading = inject('loading');
/** @type {AddToast} */
const addToast = inject('addToast');

// Fetch the list of events
loading.value = true;
API('calendar').then(({ result }) => {
	events.value = result.data;
	loading.value = false;
}).catch(() => loading.value = false);

/**
 * Trigger the deletion of an event and refreshes the table content
 *
 * @param {CalendarEvent} event Event to remove
 * @returns {Promise<void>}
 */
async function deleteEvent(event) {
	loading.value = true;
	await API(`calendar/${event.id}`, { method: 'delete' });
	events.value = await API('calendar').then(({ result }) => result.data);
	addToast({
		title: 'Calendar Event Removed',
		body: `Calendar event "${event.summary}" (${event.id}) successfully removed.`
	});
	loading.value = false;
}
</script>

<template>
	<div class="card-body">
		<h4 class="card-title d-flex justify-content-between">
			<span>
				Calendar Events
			</span>
			<router-link class="btn btn-primary btn-sm" :to="{ name: 'Admin Create Calendar Event' }">
				New Item
			</router-link>
		</h4>
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
