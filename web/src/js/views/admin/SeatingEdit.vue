<script setup>
import { computed, ref, inject } from 'vue';
import { nanoid } from 'nanoid';

import { useLoader } from 'composables/loader';
import { useForm } from 'composables/form';
import { statusMessages } from 'lib/formatter';

import CardHeader from 'components/CardHeader.vue';
import DiningTable from 'components/DiningTable.vue';
import InfoPopover from 'components/InfoPopover.vue';

/** @type {AddToast} */
const addToast = inject('addToast');

const headerHeight = Number(getComputedStyle(document.body)
	.getPropertyValue('--header-height')
	.split('px')[0]);

const guests = ref([]);
const tables = ref([]);
const searchTerm = ref('');
const searchSuggestions = ref([]);
const maxGuestHeight = ref(`${window.innerHeight - (2 * headerHeight)}px`);

useLoader([
	'invitation',
	'seating'
], ([ invitationResponse, seatingResponse ]) => {
	const suggestions = new Set();
	guests.value = invitationResponse.result.data.reduce((arr, invitation) => {
		for (const [ idx, guest ] of invitation.guests?.entries() || []) {
			// Skip the guest if they are marked as not attending the reception
			if (guest.status_reception === 3) {
				continue;
			}
			// Add their name to the search suggestion list
			suggestions.add(guest.name);
			// And then add them to the flattened guest set
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
			// Add their name to the search suggestion list
			suggestions.add(child.name);
			arr.push({
				id: invitation.id,
				idx,
				name: child.name,
				child: true
			});
		}
		return arr;
	}, []);

	searchSuggestions.value = Array.from(statusMessages).slice(0, -1).concat(Array.from(suggestions));

	// Map the stored table structure to the enriched version we use for the form.
	// This includes adding an id for vue to track each item with, and using the above
	// defined name/status enriched object in the place of the stored occupant
	tables.value = (seatingResponse.result.data || []).map(table => ({
		id: nanoid(),
		guests: table.map(occupant => {
			return guests.value.find(guest => guest.id === occupant.id
				&& guest.idx === occupant.idx
				&& guest.child === occupant.child
			) || {};
		})
	}));
});

const { onSubmit } = useForm({
	path: 'seating',
	method: 'PUT',
	body() {
		// Flatten the table to the base array of arrays, and return the supplementary data from the table guest store
		return {
			items: tables.value.map(table => table.guests.map(guest => ({
				'id': guest.id,
				'idx': guest.idx,
				'child': guest.child
			})))
		};
	},
	onSuccess() {
		addToast({
			title: 'Seating plan Updated',
			body: 'Seating plan successfully saved.'
		});
	}
});

/**
 * Expose the set of guests that are not currently defined in any chair
 */
const unassignedGuests = computed(() => {
	return guests.value.filter(guest => {
		return !tables.value.some(table => table.guests.some(tableGuest => {
			return tableGuest.id === guest.id && tableGuest.idx === guest.idx && tableGuest.child === guest.child;
		}));
	});
});

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
 * Define an occupant for a chair in a given table
 *
 * @param {Number} tableIdx Index of the table to add the occupant to
 * @param {{ occupant: DiningTableSeat, chairIdx: Number, previous?: DiningTableSeat }} occupantInfo The occupant and the chair number at the table to add them to
 */
function setSeat(tableIdx, { occupant, chairIdx }) {
	// Check if the target occupant was already in a chair
	const sourceChairIdx = occupant.chairIdx;
	const sourceTableIdx = occupant.tableIdx;
	// Remove the stored values to not set them on the new chair
	delete occupant.chairIdx;
	delete occupant.tableIdx;
	// If they were already in a chair, swap them with any existing occupant in the target chair
	if (sourceChairIdx !== undefined && sourceTableIdx !== undefined) {
		[
			tables.value[tableIdx].guests[chairIdx],
			tables.value[Number(sourceTableIdx) - 1].guests[Number(sourceChairIdx)]
		] = [
			tables.value[Number(sourceTableIdx) - 1]?.guests?.[Number(sourceChairIdx)] || {},
			tables.value[tableIdx].guests[chairIdx]
		];

	// Otherwise, just set them in the seat
	} else {
		tables.value[tableIdx].guests[chairIdx] = occupant;
	}
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
 * Returns whether a given guest matches the current search term
 * @param {DiningTableSeat} guest
 * @returns {Boolean}
 */
function hasSearchMatch(guest) {
	if (!searchTerm.value) {
		return false;
	}
	return guest?.id === searchTerm.value
		|| guest?.name === searchTerm.value
		|| guest?.status === searchTerm.value;
}

/**
 * Attempts to focus any matches for the current search term
 */
function onSearch() {
	// If there is no search term, there won't be anything to focus
	if (!searchTerm.value) {
		return;
	}
	// Find all items on the DOM with the `active` class
	const $searchResults = document.querySelectorAll('.active');
	let $highest;
	// Find which element is highest on the DOM
	$searchResults.forEach($el => {
		if (!$highest || ($el.offsetHeight && $el.offsetHeight < $highest.offsetHeight)) {
			$highest = $el;
		}
	});
	// If one was found, scroll it into view
	$highest?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Drag source event handlers
 */

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
 * Drag receipt event handlers
 */

/**
 * Adds the 'hovering' class to a unassigned guests el when an occupant is dragged over it
 *
 * @param {DragEvent} evt
 */
function onDragEnter(evt) {
	evt.dataTransfer.dropEffect = 'move';
	document.getElementById('unassigned-guests').classList.add('hovering');
}

/**
 * Maintains the 'move' drop effect when the cursor moves within the chair drop target
 *
 * @param {DragEvent} evt
 */
function onDragOver(evt) {
	evt.dataTransfer.dropEffect = 'move';
}

/**
 * Reset the 'hovering' class on the unassigned guests el when the cursor leaves its bounds
 */
function onDragLeave() {
	document.getElementById('unassigned-guests').classList.remove('hovering');
}

/**
 * Handle an occupant being dragged onto a chair
 *
 * @param {DragEvent} evt
 */
function onDropped(evt) {
	document.getElementById('unassigned-guests').classList.remove('hovering');
	// Parse the occupant data stored in the data transfer
	const occupant = JSON.parse(evt.dataTransfer.getData('wedding-manager/occupant'));

	const sourceChairIdx = occupant.chairIdx;
	const sourceTableIdx = occupant.tableIdx;
	if (sourceChairIdx !== undefined && sourceTableIdx !== undefined) {
		tables.value[Number(sourceTableIdx) - 1].guests[Number(sourceChairIdx)] = {};
	}
}
</script>

<template>
	<div class="card-body">
		<card-header title="Edit Seating Plan" :back="{ name: 'Admin View Seating Plan' }" :on-submit />
		<form class="card-text row" @submit.prevent.stop="onSubmit">
			<input
				v-model="searchTerm"
				class="form-control mx-auto w-75 mb-3"
				placeholder="Search"
				:list="searchSuggestions.length && 'searchSuggestions' || undefined"
				@keyup.escape="searchTerm = ''"
				@keydown.enter.prevent="onSearch"
			>
			<datalist v-if="searchSuggestions.length" id="searchSuggestions">
				<option v-for="item in searchSuggestions" :key="item" :value="item" />
			</datalist>
			<div class="col-12 order-md-0 order-1" :class="{ 'col-md-7': unassignedGuests.length }">
				<div v-for="(table, idx) in tables" :key="table.id">
					<hr v-if="idx">
					<dining-table
						:id="String(idx + 1)"
						:occupants="table.guests"
						:search-term
						:style="idx === 0 ? 'rectangle' : undefined"
						class="d-inline-block"
						edit
						@set-seat="evt => setSeat(idx, evt)"
					/>
					<ol class="d-inline-block">
						<li
							v-for="(guest, guestIdx) in table.guests"
							:key="guestIdx"
							:class="{ 'fw-bold': hasSearchMatch(guest), 'text-muted': !guest?.name }"
						>
							<info-popover v-if="guest?.name" :hint="guest?.name && popoverHint(guest) || ''" :opts="{ html: true }">
								{{ guest.name }}
							</info-popover>
							<template v-else>
								Unassigned
							</template>
						</li>
					</ol>
					<div class="pb-1 d-flex gap-3 align-items-center">
						<button
							type="button"
							class="btn btn-sm btn-primary"
							:disabled="table.guests.length >= (idx === 0 ? 6 : 8)"
							@click="table.guests.push({})"
							v-text="'Add Chair'"
						/>
						<button
							type="button"
							class="btn btn-sm btn-primary"
							:disabled="table.guests.length <= 1"
							@click="table.guests.pop()"
							v-text="'Remove Chair'"
						/>
						<button
							type="button"
							class="btn btn-sm btn-danger"
							@click="removeTable(idx)"
							v-text="'Remove Table'"
						/>
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
			<div
				id="unassigned-guests"
				class="col-md-5 col-12 order-md-1 order-0 h-100"
				@dragenter.prevent.stop="onDragEnter"
				@dragover.prevent.stop="onDragOver"
				@dragleave.prevent.stop="onDragLeave"
				@drop.prevent.stop="onDropped"
			>
				<span class="fw-bold">
					Unassigned Guests
				</span>
				<ul>
					<li
						v-for="guest in unassignedGuests"
						:key="`${guest.id}-${Number(guest.child)}-${guest.idx}`"
						:class="[
							{ child: guest?.child, 'fw-bold active': hasSearchMatch(guest) },
							(guest?.status || '').toLowerCase().replace(' ', '-')
						]"
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
		</form>
	</div>
</template>

<style lang="scss" scoped>
#unassigned-guests {
	position: sticky;
	top: calc((var(--card-offset) * -1) + var(--header-height) + 16px);
	max-height: v-bind(maxGuestHeight);
	overflow-y: scroll;

	&.hovering {
		// Add a dotted border to signify the unassigned guests section as a drop target
		border: 1px dotted var(--bs-body-color);

		// When the hovering style is applied to the unassigned guests section, disable pointer events on all its children
		// If we don't do this, then all child elements will also trigger dragenter events
		* {
			pointer-events: none;
		}
	}

	li {
		list-style-position: outside;
		cursor: grab;

		&::marker {
			content: '⠿ ';
			line-height: 0;
			font-size: larger;
		}

		&.attending::marker {
			color: var(--bs-success);
		}

		&.tentative::marker {
			color: var(--bs-warning-border-subtle);
		}

		&.pending::marker {
			color: var(--bs-gray-400);
		}

		&.not-attending::marker {
			color: var(--bs-danger-border-subtle);
		}

		&.child::marker {
			color: var(--bs-info-border-subtle);
		}
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
