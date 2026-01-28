<script setup>
import { computed, inject, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { useForm } from 'composables/form';
import { useLoader } from 'composables/loader';
import { statusMessages } from 'lib/formatter';

import CardBody from 'components/CardBody.vue';
import InfoPopover from 'components/InfoPopover.vue';
import TableComponent from 'components/TableComponent.vue';

/** @type {Ref<Invitation[]>} */
const invitations = ref([]);

/** @type {AddToast} */
const addToast = inject('addToast');

useLoader('invitation', invitations);

const menuRequest = 'Menu Request';

const { onSubmit: deleteInvitation } = useForm({
	method: 'DELETE',
	path: invitation => `invitation/${invitation.id}`,
	onSuccess(_data, _response, invitation) {
		const guestMsg = invitation.guests[0].name
			? `${invitation.guests[0].name}${invitation.guests.length > 1 ? ` & ${invitation.guests.length - 1} other guest${invitation.guests.length > 2 ? 's' : ''}` : ''}`
			: `${invitation.guests.length} guest${invitation.guests.length > 1 ? 's' : ''}`;
		addToast({
			title: 'Invitation Removed',
			body: `Invitation for "${guestMsg}" (${invitation.id}) successfully removed.`
		});
		// Refetch the invitations for the table
		useLoader('invitation', invitations);
	}
});

const searchSuggestions = computed(() => {
	const items = [];
	for (const invitation of invitations.value) {
		for (const guest of invitation.guests || []) {
			guest.name && items.push(guest.name);
		}
	}
	return [ ...statusMessages, menuRequest ].concat(items.sort());
});

const tableOpts = {
	caption: 'Invitation',
	columns: [
		{ id: 'id', text: 'Invitation ID' },
		{ id: 'name', text: 'Name', sort(a, b, dir) {
			const nameA = a.guests?.[0]?.name?.toUpperCase();
			const nameB = b.guests?.[0]?.name?.toUpperCase();
			if (nameA < nameB) {
				return dir * -1;
			}
			if (nameA > nameB) {
				return dir * 1;
			}
			return 0;
		} },
		{ id: 'guests', text: 'Guests', sort(a, b, dir) {
			return ((a?.guests?.length || 0) - (b?.guests?.length || 0)) * dir;
		} },
		{ id: 'children', text: 'Children', sort(a, b, dir) {
			return ((a?.children?.length || 0) - (b?.children?.length || 0)) * dir;
		} },
		{ id: 'created', text: 'Created', sort(a, b, dir) {
			const _a = new Date(a.created);
			const _b = new Date(b.created);
			return (_a - _b) * dir * -1;
		} },
		{ id: 'updated', text: 'Updated', sort(a, b, dir) {
			const _a = new Date(a.created);
			const _b = new Date(b.created);
			return (_a - _b) * dir * -1;
		} },
		{ id: 'status', text: 'Status' }
	],
	search(item, term) {
		// Match on the invitation ID
		if (item.id === term) {
			return true;
		}
		const statusIndex = statusMessages.indexOf(term);
		if (statusIndex > -1 && item.guests.some(guest => guest.name && (guest.status_ceremony === statusIndex || guest.status_reception === statusIndex))) {
			return true;
		}
		// Or if a guest or child's name case-insensitively matches the term, or if they have a menu item matching the term
		if (item.guests?.some(guest => guest.name.toLowerCase().includes(term.toLowerCase())
			|| [ guest.starter_id, guest.main_id, guest.dessert_id ].includes(term === menuRequest ? 'other' : term))) {
			return true;
		}
		if (item.children?.some(child => child.name.toLowerCase().includes(term.toLowerCase())
			|| [ child.starter_id, child.main_id, child.dessert_id ].includes(term === menuRequest ? 'other' : term))) {
			return true;
		}
		// Otherwise, no match
		return false;
	},
	suggestions: searchSuggestions,
	actions(item) {
		if (!item.id) {
			return [];
		}
		return [
			{ text: 'View', to: { name: 'Admin View Invitation', params: { invitationId: item.id } } },
			{ text: 'Edit', to: { name: 'Admin Edit Invitation', params: { invitationId: item.id } } },
			{ text: 'Share', to: { name: 'Admin View Invitation Card', params: { invitationId: item.id } } },
			{ divider: true },
			{ text: 'Delete', onClick: () => deleteInvitation(item), class: 'text-danger' }
		];
	}
};

/**
 * Construct a status message for a given invitation
 *
 * @param {Invitation} invitation invitation record
 * @returns {{ message: String, class: String }}
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

	// We'll want to output two things, the displayed message for the popover, and the class(es) for the indicator badge styling
	const out = {
		message: '',
		class: ''
	};
	// Track the displayed status for each part of the event to use for the indicator badge classes
	let ceremonyStatus = 0;
	let receptionStatus = 0;

	// Loop through each potential status value
	for (let i = 0; i <= 3; i++) {
		// If all the named invitation guests have the same status, mark them with just that
		if (!out.message && stats.ceremony[i] === namedGuestCount && stats.reception[i] === namedGuestCount) {
			out.message = `${namedGuestCount} ${statusMessages[i]}`;
			ceremonyStatus = receptionStatus = i;
			continue;
		}
		// If all the named invitees have this status for the ceremony and/or reception then that
		// is the one to show for the respective part of the badge
		if (stats.ceremony[i] === namedGuestCount) {
			ceremonyStatus = i;
		}
		if (stats.reception[i] === namedGuestCount) {
			receptionStatus = i;
		}
	}
	// Define the classes to use on the badge, we'll have an appropriate value at this point
	out.class = `start-${ceremonyStatus} end-${receptionStatus}`;
	// If we have a message already, return now
	if (out.message) {
		return out;
	}

	// Otherwise, construct strings for the counts of each status for the ceremony and reception
	const messages = {
		ceremony: [],
		reception: []
	};
	for (const section of [ 'ceremony', 'reception' ]) {
		for (let i = 0; i <= 3; i++) {
			if (stats[section][i]) {
				messages[section].push(`${stats[section][i]} ${statusMessages[i]}`);
			}
		}
	}
	out.message ||= `Ceremony:<br>${messages.ceremony.join('<br>')}<br><br>Reception:<br>${messages.reception.join('<br>')}`;

	return out;
}

function guestCount(item) {
	const namedGuestCount = (item.guests || []).filter(guest => guest.name)?.length || 0;
	if (namedGuestCount !== item.guests?.length) {
		return `${namedGuestCount} (+${item.guests.length - namedGuestCount})`;
	}
	return String(namedGuestCount);
}
</script>

<template>
	<card-body title="Invitations" :back="{ name: 'Admin Overview' }" :action="{ text: 'New Invitation', to: { name: 'Admin Create Invitation' } }">
		<div class="card-text">
			<table-component v-slot="{ item }" :items="invitations" v-bind="tableOpts">
				<th scope="row" class="font-monospace">
					<router-link :to="{ name: 'Admin View Invitation', params: { invitationId: item.id } }">
						{{ item.id }}
					</router-link>
				</th>
				<td v-text="item.guests?.[0]?.name || '---'" />
				<td v-text="guestCount(item)" />
				<td v-text="item.children?.length || 0" />
				<td v-text="new Date(item.created).toLocaleDateString()" />
				<td v-text="new Date(item.updated).toLocaleDateString()" />
				<td class="text-center" :class="invitationStatus(item).class">
					<info-popover title="Invitation Status" :hint="invitationStatus(item).message" :opts="{ html: true }">
						<div class="align-text-top d-inline-flex bg-split-status px-3 py-2 rounded-5" />
					</info-popover>
				</td>
			</table-component>
		</div>
	</card-body>
</template>

<style lang="scss" scoped>
td {
	&.start-0 {
		--start-bg: var(--bs-gray-500);
	}

	&.end-0 {
		--end-bg: var(--bs-gray-500);
	}

	&.start-1 {
		--start-bg: var(--bs-success);
	}

	&.end-1 {
		--end-bg: var(--bs-success);
	}

	&.start-2 {
		--start-bg: var(--bs-info);
	}

	&.end-2 {
		--end-bg: var(--bs-info);
	}

	&.start-3 {
		--start-bg: var(--bs-danger);
	}

	&.end-3 {
		--end-bg: var(--bs-danger);
	}

	.bg-split-status {
		background-image: linear-gradient(120deg, var(--start-bg) 50%, var(--end-bg) 50%);
	}
}
</style>
