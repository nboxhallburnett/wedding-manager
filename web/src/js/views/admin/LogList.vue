<script setup>
import { ref, useTemplateRef } from 'vue';
import { RouterLink } from 'vue-router';

import { fromNow } from 'lib/formatter.js';

import { useLoader } from 'composables/loader';

import CardBody from 'components/CardBody.vue';
import InfoPopover from 'components/InfoPopover.vue';
import TableComponent from 'components/TableComponent.vue';

const $table = useTemplateRef('table');

/** @type {Ref<Log[]>} */
const logs = ref([]);

useLoader('admin/logs', logs);

const tableOpts = {
	caption: 'Log',
	columns: [
		{ id: 'created', text: 'Time' },
		{ id: 'ns', text: 'Context' },
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
		// Match on the namespace case-insensitively
		if (item.ns.toLowerCase().includes(term.toLowerCase())) {
			return true;
		}
		// Otherwise, no match
		return false;
	}
};

function createdDisplay(created) {
	const now = new Date();
	const date = new Date(created);

	// If the log item is for the current day, just return the time
	if (now.getDay() === date.getDay()) {
		return date.toLocaleTimeString();
	}
	// Otherwise return the full locale string
	return date.toISOString().replace('T', ' ').slice(0, -5);
}

function setSearch(value) {
	$table.value.searchTerm = value;
}
</script>

<template>
	<card-body title="Logs" :back="{ name: 'Admin Overview' }">
		<div class="card-text">
			<table-component v-slot="{ item }" v-bind="tableOpts" ref="table" :items="logs">
				<th scope="row" class="fw-normal font-monospace">
					<info-popover
						:hint="`<span class=font-monospace>${new Date(item.created).toISOString()}</span>`"
						:opts="{ html: true }"
					>
						{{ createdDisplay(item.created) }}
					</info-popover>
				</th>
				<td class="font-monospace text-nowrap">
					<info-popover :hint="item.ns" :opts="{ trigger: 'hover focus click' }">
						{{ item.ns.split(':')[0] }}
					</info-popover>
					<a href="#" class="text-decoration-none" @click="setSearch(item.ns)">
						🔍
					</a>
				</td>
				<td class="font-monospace" v-text="item.message" />
			</table-component>
		</div>
	</card-body>
</template>
