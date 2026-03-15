<script setup>
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { useLoader } from 'composables/loader';

import CardBody from 'components/CardBody.vue';
import TableComponent from 'components/TableComponent.vue';

/** @type {Ref<Invitation[]>} */
const invitations = ref([]);

useLoader('invitation', invitations);
const requirements = computed(() => {
	return invitations.value.reduce((list, invitation) => {
		// Add individual entries per guest
		for (const guest of invitation.guests || []) {
			// Ignore guests that are not attending or do not have a dietary requirement
			if (guest.status_ceremony === 3 || !guest.diet) {
				continue;
			}
			list.push({
				id: invitation.id,
				name: guest.name,
				diet: guest.diet
			});
		}
		// Add individual entries per child
		for (const child of invitation.children || []) {
			// Ignore children that do not have a dietary requirement
			if (!child.diet) {
				continue;
			}
			list.push({
				id: invitation.id,
				name: child.name,
				diet: child.diet
			});
		}
		return list;
	}, []);
});

const tableOpts = {
	caption: 'Dietary Requirement',
	columns: [
		{ id: 'id', text: 'Invitation' },
		{ id: 'name', text: 'Name' },
		{ id: 'diet', text: 'Requirement' }
	],
	search(item, term) {
		// Match on the invitation ID
		if (item.id === term) {
			return true;
		}
		// Match on the name case-insensitively
		if (item.name.toLowerCase().includes(term.toLowerCase())) {
			return true;
		}
		// Match on the dietary requirement case-insensitively
		if (item.diet.toLowerCase().includes(term.toLowerCase())) {
			return true;
		}
		// Otherwise, no match
		return false;
	}
};
</script>

<template>
	<card-body title="Dietary Requirements" :back="{ name: 'Admin Overview' }">
		<div class="card-text">
			<table-component v-slot="{ item }" :items="requirements" v-bind="tableOpts">
				<th scope="row" class="font-monospace">
					<router-link :to="{ name: 'Admin View Invitation', params: { invitationId: item.id } }">
						{{ item.id }}
					</router-link>
				</th>
				<td v-text="item.name" />
				<td v-text="item.diet" />
			</table-component>
		</div>
	</card-body>
</template>
