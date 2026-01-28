<script setup>
import { computed, ref, inject, useTemplateRef } from 'vue';

import { useLoader } from 'composables/loader';
import { useForm } from 'composables/form';

import FormItem from 'components/form/FormItem.vue';
import CardBody from 'components/CardBody.vue';
import DiningTable from 'components/DiningTable.vue';

/** @type {AddToast} */
const addToast = inject('addToast');

/** @type {Ref<DiningRoom>} */
const seating = ref({
	ratio: 1,
	scale: 1,
	tables: []
});
const searchTerm = ref('');
const searchSuggestions = ref([]);
const zoom = ref(1);
const movingTableId = ref('');
const $roomContainer = useTemplateRef('room-container');

const ratio = computed(() => seating.value.ratio);
const scale = computed(() => seating.value.scale);

useLoader('seating?enrich=true', (seatingResponse) => {
	// Set the search suggestions to be the list of table occupant names
	searchSuggestions.value = seatingResponse.result.data?.tables?.flatMap(table => table.guests?.map(guest => guest.name))
		.filter(Boolean);

	seating.value = {
		...seatingResponse.result.data,
		scale: seatingResponse.result.data?.scale || 1,
		ratio: seatingResponse.result.data?.ratio || 1,
		tables: (seatingResponse.result.data?.tables || []).map(table => ({
			...table,
			x: table.x || 0,
			y: table.y || 0,
			rotation: table.rotation || 0
		}))
	};
});

const { onSubmit } = useForm({
	path: 'seating',
	method: 'PUT',
	body() {
		// Ensure we're posting the form with correct types
		return {
			...seating.value,
			scale: Number(seating.value.scale || 1),
			ratio: Number(seating.value.ratio || 1),
			tables: seating.value.tables.map(table => ({
				...table,
				x: Number(table.x || 0),
				y: Number(table.y || 0),
				rotation: Number(table.rotation || 0),
				// Map the guest values to un-enrich them for the db
				guests: table.guests.map(guest => ({
					id: guest.id,
					idx: guest.idx,
					child: guest.child
				}))
			}))
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
 * Handle the initialisation of a table move occurrence
 *
 * @param {DragEvent} evt
 * @param {DiningRoom['tables'][number]} table
 * @param {Number} idx
 */
function onDragStart(evt, table, idx) {
	// Define the drag operation settings
	evt.dataTransfer.effectAllowed = 'move';
	evt.dataTransfer.dropEffect = 'move';
	// And store a serialised copy of the data about the table to move
	evt.dataTransfer.setData('wedding-manager/table', JSON.stringify({
		id: table.id,
		idx,
		pageX: evt.pageX,
		pageY: evt.pageY
	}));

	// Hide all other tables so as to not have them appear in the generated drag image
	movingTableId.value = table.id;
	// Then immediately reset it once the image has been generated
	setTimeout(() => {
		movingTableId.value = '';
	}, 0);

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
 * Drag receipt event handlers
 */

/**
 * Adds the 'hovering' class to a unassigned guests el when an occupant is dragged over it
 *
 * @param {DragEvent} evt
 */
function onDragEnter(evt) {
	evt.dataTransfer.dropEffect = 'move';
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
 * Handle an occupant being dragged onto a chair
 *
 * @param {DragEvent} evt
 */
function onDropped(evt) {
	// Get the table data from the initial drag event
	const data = JSON.parse(evt.dataTransfer.getData('wedding-manager/table'));

	// Get the room dimensions. This is done per occurrance to handle screen resizing since page load
	const roomWidth = $roomContainer.value.clientWidth;
	const roomHeight = $roomContainer.value.clientHeight;

	// Get the X and Y positioning of the table relative to the room container
	const tableX = (roomWidth / 100 * (seating.value.tables[data.idx].x || 0)) + (evt.pageX - data.pageX);
	const tableY = (roomHeight / 100 * (seating.value.tables[data.idx].y || 0)) + (evt.pageY - data.pageY);

	// Convert the pixel values to relative percentages so the positions scale with viewport size changes
	const tableXPercent = tableX / roomWidth * 100;
	const tableYPercent = tableY / roomHeight * 100;

	// Set the percentages on the table
	seating.value.tables[data.idx].x = tableXPercent.toFixed(2);
	seating.value.tables[data.idx].y = tableYPercent.toFixed(2);
}
</script>

<template>
	<card-body title="Edit Seating Layout" :back="{ name: 'Admin View Seating Plan' }" :on-submit>
		<form class="card-text row p-3" @submit.prevent.stop="onSubmit">
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
			<form-item name="zoom" label="Zoom">
				<input
					v-model="zoom"
					type="range"
					class="form-range form-control h-auto px-3"
					min="0"
					max="1"
					step="0.01"
				>
				<span class="input-group-text" v-text="Math.round(zoom * 100) + '%'" />
			</form-item>
			<form-item name="tableScale" label="Table Scale">
				<input
					v-model="seating.scale"
					type="range"
					class="form-range form-control h-auto px-3"
					min="0"
					max="1.5"
					step="0.01"
				>
				<span class="input-group-text" v-text="Math.round(seating.scale * 100) + '%'" />
			</form-item>
			<form-item name="roomRatio" label="Room Ratio">
				<input
					v-model="seating.ratio"
					type="range"
					class="form-range form-control h-auto px-3"
					min="0"
					max="5"
					step="0.1"
				>
				<span class="input-group-text" v-text="seating.ratio" />
			</form-item>
			<div
				id="room-container"
				ref="room-container"
				:class="{ 'border-0': movingTableId }"
				@dragenter.prevent="onDragEnter"
				@dragover.prevent="onDragOver"
				@drop.prevent="evt => onDropped(evt, idx)"
			>
				<div
					v-for="(table, idx) in seating.tables"
					:key="table.id"
					class="hover-controls"
					:class="{ 'invisible': movingTableId && movingTableId !== table.id }"
					:style="{ '--table-x': (table.x || 0) + '%', '--table-y': (table.y || 0) + '%' }"
				>
					<dining-table
						:id="String(idx + 1)"
						class="d-inline-block layout-table"
						:occupants="table.guests"
						:search-term
						:style="idx === 0 ? 'rectangle' : undefined"
						:rotation="Number(table.rotation || 0)"
						:draggable="true"
						@dragstart="evt => onDragStart(evt, table, idx)"
						@dragend="onDragEnd"
					/>
					<div class="pt-1 hover-visible">
						<div class="input-group input-group-sm w-50 d-inline-flex">
							<span class="input-group-text">X</span>
							<input
								v-model="table.x"
								type="number"
								class="form-control form-control-sm text-end"
								min="0"
								max="100"
							>
							<span class="input-group-text">%</span>
						</div>
						<div class="input-group input-group-sm w-50 d-inline-flex">
							<span class="input-group-text">Y</span>
							<input
								v-model="table.y"
								type="number"
								class="form-control form-control-sm text-end"
								min="0"
								max="100"
							>
							<span class="input-group-text">%</span>
						</div>
						<div class="input-group input-group-sm">
							<input
								v-model="table.rotation"
								type="range"
								class="form-range form-control form-control-sm w-50 bg-body"
								min="0"
								max="360"
							>
							<input
								v-model="table.rotation"
								class="form-control form-control-sm text-end"
								min="0"
								max="360"
								type="number"
							>
							<span class="input-group-text">°</span>
						</div>
					</div>
				</div>
			</div>
		</form>
	</card-body>
</template>

<style lang="scss" scoped>
$room-ratio: v-bind(ratio);
$zoom: v-bind(zoom);
$table-scale: v-bind(scale);

#room-container {
	position: relative;
	width: 100%;
	aspect-ratio: 1 / $room-ratio;
	border: 1px solid var(--bs-primary);
	padding: 0;
	transform: scale($zoom);
	transform-origin: top;
}

.hover-controls {
	width: auto;
	height: auto;
	position: absolute;
	left: var(--table-x);
	top: var(--table-y);
	transform: scale($table-scale);

	.layout-table {
		border: 2px dotted transparent;
	}

	.hover-visible {
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	&:hover {
		z-index: 1;

		.hover-visible {
			opacity: 1;
		}

		.layout-table {
			border-color: var(--bs-secondary);
			cursor: grab;
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
