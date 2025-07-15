<script setup>
import { inject, ref } from 'vue';
import { RouterLink } from 'vue-router';

import API from 'lib/api';

const rsvps = ref([]);
const loading = inject('loading');
const addToast = inject('addToast');

loading.value = true;
API('rsvp').then(({ result }) => {
	rsvps.value = result.data;
	loading.value = false;
}).catch(() => loading.value = false);

async function deleteRsvp(rsvp) {
	loading.value = true;
	await API(`rsvp/${rsvp.id}`, { method: 'delete' });
	rsvps.value = await API('rsvp').then(({ result }) => result.data);
	const guestMsg = rsvp.guests[0].name
		? `${rsvp.guests[0].name}${rsvp.guests.length > 1 ? ` & ${rsvp.guests.length - 1} other guest${rsvp.guests.length > 2 ? 's' : ''}` : ''}`
		: `${rsvp.guests.length} guest${rsvp.guests.length > 1 ? 's' : ''}`;
	addToast({
		title: 'RSVP Removed',
		body: `RSVP for ${guestMsg} (${rsvp.id}) successfully removed.`
	});
	loading.value = false;
}
</script>

<template>
	<div class="card-body">
		<h5 class="card-title d-flex justify-content-between">
			<span>
				RSVPs
			</span>
			<router-link class="btn btn-primary btn-sm" :to="{ name: 'Admin Create RSVP' }">
				New Invitation
			</router-link>
		</h5>
		<div class="card-text">
			<table class="table table-hover mt-1">
				<thead>
					<tr>
						<th scope="col">
							RSVP ID
						</th>
						<th scope="col">
							Name
						</th>
						<th scope="col">
							Guests
						</th>
						<th scope="col">
							Status
						</th>
						<th scope="col" class="text-end">
							Actions
						</th>
					</tr>
				</thead>
				<tbody>
					<template v-for="item in rsvps" :key="item.id">
						<tr v-if="item.guests?.length">
							<th scope="row" class="font-monospace">
								<router-link :to="{ name: 'Admin Edit RSVP', params: { rsvpId: item.id } }">
									{{ item.id }}
								</router-link>
							</th>
							<td v-text="item.guests[0].name" />
							<td v-text="item.guests.length" />
							<td v-text="'TODO:'" />
							<td class="text-end py-1 align-middle">
								<button
									:id="`rsvp-${item.id}-actions`"
									class="icon-caret fs-4 p-0"
									type="button"
									data-bs-toggle="dropdown"
									aria-expanded="false"
								/>
								<ul class="dropdown-menu" :aria-labelledby="`rsvp-${item.id}-actions`">
									<li>
										<button class="dropdown-item" type="button">
											View
										</button>
									</li>
									<li>
										<router-link class="dropdown-item" :to="{ name: 'Admin Edit RSVP', params: { rsvpId: item.id } }">
											Edit
										</router-link>
									</li>
									<li><hr class="dropdown-divider"></li>
									<li>
										<button class="dropdown-item text-danger" type="button" @click="deleteRsvp(item)">
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
