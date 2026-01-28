<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

// import { useForm } from 'composables/form';
import { useLoader } from 'composables/loader';

import CardBody from 'components/CardBody.vue';
import InfoPopover from 'components/InfoPopover.vue';
import RelativeDate from 'components/RelativeDate.vue';
import TableComponent from 'components/TableComponent.vue';

/** @type {Ref<Telemetry[]>} */
const items = ref([]);

// Fetch the list of events
useLoader('telemetry', items);

const tableOpts = {
	caption: 'Event',
	columns: [
		{ id: 'invitation', text: 'Invitation' },
		{ id: 'path', text: 'Page' },
		{ id: 'created', text: 'Date' },
		{ id: 'viewport', text: 'Viewport' }
	],
	search(item, term) {
		// On the corresponding invitation ID
		if (item.invitation === term) {
			return true;
		}
		const _term = term.toLowerCase();
		// Or if the term case-insensitively matches the path's name
		if (item.path_name.toLowerCase().includes(_term)) {
			return true;
		}
		// Or if the term matches the path (or its definition)
		if (item.path_match === _term || item.path === _term) {
			return true;
		}
		// Or if the term matches the viewport size
		if (item.viewport === _term) {
			return true;
		}
		// Otherwise, no match
		return false;
	}
};

function pathPopover(item) {
	let out = `Path: <span class="font-monospace">${item.path_match}</span>`;
	if (item.path_match !== item.path) {
		out += `<br>Raw: <span class="font-monospace">${item.path}</span>`;
	}
	return out;
}
</script>

<template>
	<card-body title="Telemetry" :back="{ name: 'Admin Overview' }">
		<div class="card-text">
			<table-component v-slot="{ item }" :items="items" v-bind="tableOpts">
				<th scope="row">
					<router-link v-if="item.invitation" :to="{ name: 'Admin View Invitation', params: { invitationId: item.invitation } }">
						{{ item.invitation }}
					</router-link>
					<span v-else class="fw-normal text-muted" v-text="'Unauthenticated'" />
				</th>
				<td>
					<info-popover :hint="pathPopover(item)" :opts="{ html: true }">
						{{ item.path_name }}
					</info-popover>
				</td>
				<td>
					<relative-date :date="item.created" />
				</td>
				<td v-text="item.viewport" />
			</table-component>
		</div>
	</card-body>
</template>
