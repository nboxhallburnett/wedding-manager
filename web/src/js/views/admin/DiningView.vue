<script setup>
import { computed, ref } from 'vue';
import { nanoid } from 'nanoid';

import { useLoader } from 'composables/loader';
import { statusMessages } from 'lib/formatter';

import CardHeader from 'components/CardHeader.vue';
import DiningTable from 'components/DiningTable.vue';
import InfoPopover from 'components/InfoPopover.vue';

const guests = ref([]);

useLoader('invitation', response => {
	guests.value = response.result.data.reduce((arr, invitation) => {
		for (const [ idx, guest ] of invitation.guests?.entries() || []) {
			// Skip the guest if they are marked as not attending the reception
			if (guest.status_reception === 3) {
				continue;
			}
			arr.push({
				id: invitation.id,
				idx,
				name: guest.name || '(+1)',
				status: statusMessages[guest.status_reception],
				child: false
			});
		}
		// If all defined guests are marked as not attending then do not add any defined children
		if (arr[arr.length - 1].id !== invitation.id) {
			return arr;
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

/**
 * Expose the set of guests that are not currently defined in any chair
 */
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

/**
 * Generate the hint to show when hovering over a guest or child
 *
 * @param {DiningTableSeat} occupant occupant to generate hint content for
 * @returns {String}
 */
function popoverHint(occupant) {
	return `<b>ID</b>: <span class="font-monospace">${occupant.id}</span><br>${occupant.child ? 'Child' : `<b>Status</b>: ${occupant.status}`}`;
}

/**
 * Handle the initialisation of an occupant drag occurrence
 *
 * @param {DragEvent} evt
 * @param {DiningTableSeat} occupant
 */
function onDragStart(evt, occupant) {
	// Define the drag operation settings
	evt.dataTransfer.effectAllowed = 'move';
	evt.dataTransfer.dropEffect = 'move';
	// And store a serialised copy of the occupant to be transferred
	evt.dataTransfer.setData('wedding-manager/occupant', JSON.stringify(occupant));

	// Add a 'dragging' class to body to add an appropriate cursor style
	window.document.body.classList.add('dragging');
}

/**
 * Remove the 'dragging' class from body when the occupant dragging ends
 */
function onDragEnd() {
	window.document.body.classList.remove('dragging');
}

/**
 * Scroll the container page if a drag item is moved near the top or bottom of the viewport
 *
 * @param {DragEvent} evt
 */
function onDragging(evt) {
	// If the cursor is near the top of the viewport, scroll up
	if (evt.clientY <= 75){
		window.scrollBy(0, -33);
	}
	// Likewise, if the cursor is near the bottom then scroll down
	if(evt.clientY >= window.innerHeight - 75){
		window.scrollBy(0, 33);
	}
}

/**
 * Define an occupant for a chair in a given table
 *
 * @param {Number} tableIdx Index of the table to add the occupant to
 * @param {{ occupant: DiningTableSeat, chairIdx: Number }} occupantInfo The occupant and the chair number at the table to add them to
 */
function setSeat(tableIdx, { occupant, chairIdx }) {
	tables.value[tableIdx].guests[chairIdx] = occupant;
}
</script>

<template>
	<card-header title="Seating Plan" />
	<!-- TODO: Search by invitation ID or name -->
	<div class="card-text row">
		<div class="col-12 order-md-0 order-1" :class="{ 'col-md-7': unassignedGuests.length }">
			<div v-for="(table, idx) in tables" :key="table.id">
				<hr v-if="idx">
				<dining-table
					:id="String(idx + 1)"
					:occupants="table.guests"
					class="d-inline-block"
					@set-seat="evt => setSeat(idx, evt)"
				/>
				<ol class="d-inline-block">
					<li v-for="(guest, guestIdx) in table.guests" :key="guestIdx">
						{{ guest.name || 'Unassigned' }}
					</li>
				</ol>
				<div class="pb-1 d-flex gap-3 align-items-center">
					<button
						class="btn btn-sm btn-primary"
						:disabled="table.guests.length >= 8"
						@click="table.guests.push({})"
						v-text="'Add Chair'"
					/>
					<button
						class="btn btn-sm btn-primary"
						:disabled="table.guests.length <= 1"
						@click="table.guests.pop()"
						v-text="'Remove Chair'"
					/>
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
			<ul id="unassigned-guests">
				<li
					v-for="guest in unassignedGuests"
					:key="`${guest.id}-${Number(guest.child)}-${guest.idx}`"
					draggable="true"
					@dragstart="evt => onDragStart(evt, guest)"
					@dragend="onDragEnd"
					@drag="onDragging"
				>
					<info-popover :hint="popoverHint(guest)" :opts="{ html: true, placement: 'left' }">
						{{ guest.name }}
					</info-popover>
				</li>
			</ul>
			<hr class="d-md-none">
		</div>
	</div>
</template>

<style lang="scss" scoped>
#unassigned-guests li {
	list-style-position: outside;
	cursor: grab;

	&::marker {
		content: '⠿ ';
		line-height: 0;
		font-size: larger;
	}
}
</style>

<style lang="scss">
.dragging {
	* {
		cursor: grabbing !important;
	}
}
</style>
