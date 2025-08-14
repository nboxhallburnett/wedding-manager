<script setup>
import { computed, ref } from 'vue';
import { nanoid } from 'nanoid';

import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';
import DiningTable from 'components/DiningTable.vue';
import InfoPopover from 'components/InfoPopover.vue';

const guests = ref([]);

useLoader('invitation', response => {
	guests.value = response.result.data.reduce((arr, invitation) => {
		for (const [ idx, guest ] of invitation.guests?.entries() || []) {
			arr.push({
				id: invitation.id,
				idx,
				name: guest.name || '(+1)',
				child: false
			});
		}
		for (const [ idx, child ] of invitation.children?.entries() || []) {
			arr.push({
				id: invitation.id,
				idx,
				name: child.name,
				child: true
			});
		}
		return arr;
	}, []);
});

const unassignedGuests = computed(() => {
	return guests.value.filter(guest => {
		return !tables.value.some(table => table.guests.some(tableGuest => {
			return tableGuest.id === guest.id && tableGuest.idx === guest.idx;
		}));
	});
});

const tables = ref([]);

/**
 * Add a new table to the array
 */
function addTable() {
	tables.value.push({
		id: nanoid(),
		guests: [ {} ]
	});
}
/**
 * Remove a table from the array
 *
 * @param {Number} idx Index of the table to remove
 */
function removeTable(idx) {
	tables.value.splice(idx, 1);
}
/**
 * Move a table order in the list
 *
 * @param {Number} idx Index of the table to move
 * @param {Number} to Index to move the table to
 */
function moveTable(idx, to) {
	[ tables.value[idx], tables.value[to] ] = [ tables.value[to], tables.value[idx] ];
}
</script>

<template>
	<card-header title="Seating Plan" />
	<!-- TODO: Search by invitation ID or name -->
	<div class="card-text row">
		<div class="col-12 order-md-0 order-1" :class="{ 'col-md-7': unassignedGuests.length }">
			<div v-for="(table, idx) in tables" :key="table.id">
				<hr v-if="idx">
				<dining-table :id="String(idx + 1)" :occupants="table.guests" class="d-inline-block" />
				<ol class="d-inline-block">
					<li v-for="(guest, guestIdx) in table.guests" :key="guestIdx">
						{{ guest.name || 'Unassigned' }}
					</li>
				</ol>
				<div class="pb-1 d-flex gap-3 align-items-center">
					<button class="btn btn-sm btn-primary" @click="table.guests.push({})" v-text="'Add Chair'" />
					<button class="btn btn-sm btn-primary" @click="table.guests.pop()" v-text="'Remove Chair'" />
					<button class="btn btn-sm btn-danger" @click="removeTable(idx)" v-text="'Remove Table'" />
					<button
						v-if="idx !== 0"
						class="icon-caret rotate-180 fs-4 p-0"
						type="button"
						@click.prevent.stop="moveTable(idx, idx - 1)"
					>
						<div class="visually-hidden">
							Move Up
						</div>
					</button>
					<button
						v-if="tables[idx + 1]"
						class="icon-caret fs-4 p-0"
						type="button"
						@click.prevent.stop="moveTable(idx, idx + 1)"
					>
						<div class="visually-hidden">
							Move Down
						</div>
					</button>
				</div>
			</div>
			<hr v-if="tables.length">
			<button
				role="button"
				class="btn btn-primary"
				@click.prevent.stop="addTable"
				v-text="'Add Table'"
			/>
		</div>
		<div v-if="unassignedGuests.length" class="col-md-5 col-12 order-md-1 order-0">
			<span class="fw-bold">
				Unassigned Guests
			</span>
			<ul>
				<li v-for="(guest, idx) in unassignedGuests" :key="idx">
					<info-popover :hint="guest.id">
						{{ guest.name }}
					</info-popover>
				</li>
			</ul>
			<hr class="d-md-none">
		</div>
	</div>
</template>
