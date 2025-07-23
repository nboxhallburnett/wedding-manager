<script setup>
import { inject, ref } from 'vue';
import { RouterLink } from 'vue-router';

import API from 'lib/api';

/** @type {Ref<Invitation[]>} */
const invitations = ref([]);
/** @type {Ref<Boolean>} */
const loading = inject('loading');
/** @type {AddToast} */
const addToast = inject('addToast');

loading.value = true;
API('invitation').then(({ result }) => {
	invitations.value = result.data;
	loading.value = false;
}).catch(() => loading.value = false);

async function deleteRsvp(invitation) {
	loading.value = true;
	await API(`invitation/${invitation.id}`, { method: 'delete' });
	invitations.value = await API('invitation').then(({ result }) => result.data);
	const guestMsg = invitation.guests[0].name
		? `${invitation.guests[0].name}${invitation.guests.length > 1 ? ` & ${invitation.guests.length - 1} other guest${invitation.guests.length > 2 ? 's' : ''}` : ''}`
		: `${invitation.guests.length} guest${invitation.guests.length > 1 ? 's' : ''}`;
	addToast({
		title: 'Invitation Removed',
		body: `Invitation for "${guestMsg}" (${invitation.id}) successfully removed.`
	});
	loading.value = false;
}

const statusMessages = [
	'Pending',
	'Attending',
	'Tentative',
	'Not Attending'
];

/**
 * Construct a status message for a given invitation
 *
 * @param {Invitation} invitation invitation record
 * @returns {String}
 */
function invitationStatus(invitation) {
	const stats = {
		ceremony: [ 0, 0, 0, 0 ],
		reception: [ 0, 0, 0, 0 ]
	};

	// We only care about the stats for named guests here, unused +1s don't need to impact the status
	let namedGuestCount = 0;

	// Loop through the defined guests and make a tally of the named guests status'
	for (const guest of invitation.guests || []) {
		if (guest.name) {
			namedGuestCount++;
			stats.ceremony[guest.status_ceremony || 0]++;
			stats.reception[guest.status_reception || 0]++;
		}
	}

	// If all the named invitation guests have the same status, mark them with just that
	for (let i = 0; i <= 3; i++) {
		if (stats.ceremony[i] === namedGuestCount && stats.reception[i] === namedGuestCount) {
			return statusMessages[i];
		}
	}

	// Otherwise, construct strings for the counts of each status for the ceremony and reception
	const messages = {
		ceremony: [],
		reception: []
	};
	for (const section of [ 'ceremony', 'reception' ]) {
		console.log(section);
		for (let i = 0; i <= 3; i++) {
			console.log(i);
			if (stats[section][i]) {
				console.log(stats[section][i], `${stats[section][i]} ${statusMessages[i]}`);
				messages[section].push(`${stats[section][i]} ${statusMessages[i]}`);
			}
		}
	}

	return `Ceremony: ${messages.ceremony.join(', ')}\nReception: ${messages.reception.join(', ')}`;
}
</script>

<template>
	<div class="card-body">
		<h4 class="card-title d-flex justify-content-between">
			<span>
				Invitations
			</span>
			<router-link class="btn btn-primary btn-sm" :to="{ name: 'Admin Create Invitation' }">
				New Invitation
			</router-link>
		</h4>
		<div class="card-text">
			<table class="table table-hover mt-1">
				<thead>
					<tr>
						<th scope="col">
							Invitation ID
						</th>
						<th scope="col">
							Name
						</th>
						<th scope="col">
							Guests
						</th>
						<th scope="col">
							Children
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
					<template v-for="item in invitations" :key="item.id">
						<tr v-if="item.guests?.length">
							<th scope="row" class="font-monospace">
								<router-link :to="{ name: 'Admin Edit Invitation', params: { invitationId: item.id } }">
									{{ item.id }}
								</router-link>
							</th>
							<td v-text="item.guests[0].name || '---'" />
							<td class="text-end" v-text="item.guests.length" />
							<td class="text-end" v-text="item.children?.length || 0" />
							<td class="ws-pre-wrap" v-text="invitationStatus(item)" />
							<td class="text-end py-1 align-middle">
								<button
									:id="`invitation-${item.id}-actions`"
									class="icon-caret fs-4 p-0"
									type="button"
									data-bs-toggle="dropdown"
									aria-expanded="false"
								/>
								<ul class="dropdown-menu" :aria-labelledby="`invitation-${item.id}-actions`">
									<li>
										<button class="dropdown-item" type="button">
											View
										</button>
									</li>
									<li>
										<router-link class="dropdown-item" :to="{ name: 'Admin Edit Invitation', params: { invitationId: item.id } }">
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
