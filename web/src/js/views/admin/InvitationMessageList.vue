<script setup>
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { useLoader } from 'composables/loader';

import CardBody from 'components/CardBody.vue';
import InfoPopover from 'components/InfoPopover.vue';
import TableComponent from 'components/TableComponent.vue';

import { formatGuestNames } from 'lib/formatter';

/** @type {Ref<Invitation[]>} */
const invitations = ref([]);

useLoader('invitation', invitations);
const messages = computed(() => {
	return invitations.value.filter(invitation => invitation.message).map(invitation => ({
		id: invitation.id,
		name: formatGuestNames(invitation),
		message: invitation.message
	}));
});

const tableOpts = {
	caption: 'Message',
	columns: [
		{ id: 'id', text: 'Invitation' },
		{ id: 'message', text: 'Message' }
	],
	search(item, term) {
		// Match on the invitation ID
		if (item.id === term) {
			return true;
		}
		// Match on the message case-insensitively
		if (item.message.toLowerCase().includes(term.toLowerCase())) {
			return true;
		}
		// Otherwise, no match
		return false;
	}
};
</script>

<template>
	<card-body title="Messages" :back="{ name: 'Admin Overview' }">
		<div class="card-text">
			<table-component v-slot="{ item }" :items="messages" v-bind="tableOpts">
				<th scope="row" class="font-monospace">
					<router-link :to="{ name: 'Admin View Invitation', params: { invitationId: item.id } }">
						<info-popover :hint="item.name">
							{{ item.id }}
						</info-popover>
					</router-link>
				</th>
				<td v-text="item.message" />
			</table-component>
		</div>
	</card-body>
</template>
