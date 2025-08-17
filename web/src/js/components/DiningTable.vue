<script setup>
import { inject, ref } from 'vue';

import InfoPopover from './InfoPopover.vue';
import { escapeHtml } from 'lib/formatter';

const invitation = inject('invitation');

const props = defineProps({
	edit: { type: Boolean, default: false },
	id: { type: String, default: '' },
	occupants: { type: Array, default: () => [] },
	searchTerm: { type: String, default: '' },
	style: { type: String, default: 'circle' }
});

const emit = defineEmits([ 'setSeat' ]);

// Calculate the relative table and chair sizing to pass to the CSS
const tableSizePx = 150;
const chairSizePx = tableSizePx * 0.25;
const tableSize = ref(`${tableSizePx}px`);
const chairSize = ref(`${chairSizePx}px`);
const chairOffset = ref(`${(tableSizePx - (chairSizePx * 1.4)) * -1}px`);
const diameter = ref(`${tableSizePx + (3 * chairSizePx)}px`);

/**
 * Calculates the appropriate transform for a chair around the table at a given index
 *
 * @param idx Index of the chair whose position is to be generated
 */
function chairTransform(idx) {
	// The degree increment is the total degrees in the table circle divided by the number of items to surround it
	const incr = 360 / props.occupants.length;
	// Return that as a degree recognised by CSS, offset by 1 to start with chair 1 at 0deg
	return `${(idx) * incr}deg`;
}

/**
 * Generate the hint text to display for a chair depending on its occupant
 *
 * @param {DiningTableSeat} occupant
 * @returns {String}
 */
function hintText(occupant) {
	if (!occupant?.name) {
		return 'Unassigned';
	}

	if (!Object.prototype.hasOwnProperty.call(occupant, 'id')) {
		return escapeHtml(occupant.name);
	}

	return `<b>Name</b>: ${escapeHtml(occupant.name)}
		<br><b>ID</b>: <span class="font-monospace">${occupant.id}</span>
		<br>${occupant.child ? 'Child' : `<b>Status</b>: ${occupant.status}`}`;
}

/**
 * Returns whether a given guest matches the current search term
 *
 * @param {DiningTableSeat} guest
 * @returns {Boolean}
 */
function hasSearchMatch(guest) {
	// If no search term is provided, return whether the guest is defined in the active session
	if (!props.searchTerm) {
		return invitation.value.id === guest.id;
	}
	return guest?.id === props.searchTerm
		|| (guest?.name || '').toLowerCase() === props.searchTerm.toLowerCase()
		|| (guest?.status || '').toLowerCase() === props.searchTerm.toLowerCase()
		|| (guest?.starter || '').toLowerCase() === props.searchTerm.toLowerCase()
		|| (guest?.main || '').toLowerCase() === props.searchTerm.toLowerCase()
		|| (guest?.dessert || '').toLowerCase() === props.searchTerm.toLowerCase();
}

/**
 * Returns the most appropriate default position for the info popover for a chair
 *
 * @param {Number} idx Index of the chair
 * @returns {'top'|'right'|'bottom'|'left'} Placement to use for the popover
 */
function chairPopoverPlacement(idx) {
	// For rectangular tables, always put the popover above the chair
	if (props.style === 'rectangle') {
		return 'top';
	}
	// Otherwise, for circular tables calculate the position dependant on the chairs position around it.
	const incr = 360 / props.occupants.length;
	const rotation = idx * incr;
	// If the chair is in the top quarter of the table, put it above
	if (rotation < 45 || rotation > 315) {
		return 'top';
	}
	// Likewise, in the right quarter put it to the right
	if (rotation >= 45 && rotation <= 135) {
		return 'right';
	}
	// Same for the bottom
	if (rotation > 135 && rotation < 225) {
		return 'bottom';
	}
	// Which leaves the left quarter
	return 'left';
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
function onDragStart(evt, occupant, idx) {
	// Define the drag operation settings
	evt.dataTransfer.effectAllowed = 'move';
	evt.dataTransfer.dropEffect = 'move';
	// And store a serialised copy of the occupant to be transferred
	evt.dataTransfer.setData('wedding-manager/occupant', JSON.stringify({
		...occupant,
		chairIdx: idx,
		tableIdx: props.id
	}));
	// Replace the seat number with the current occupant's name for inclusion in the generated drag image
	const originalText = evt.target.children[0].textContent;
	evt.target.children[0].textContent = occupant?.name || originalText;
	// Then immediately reset it once the image has been generated
	setTimeout(() => {
		evt.target.children[0].textContent = originalText;
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
 * Adds the occupied class to a chair when an occupant is dragged over it
 *
 * @param {DragEvent} evt
 */
function onDragEnter(evt) {
	evt.dataTransfer.dropEffect = 'move';
	evt.target.classList.add('occupied');
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
 * Reset the 'occupied' class on a chair when the cursor leaves its bounds
 *
 * @param {DragEvent} evt
 */
function onDragLeave(evt, idx) {
	// Only remove the class if the seat isn't already occupied
	if (!props.occupants[idx]?.name) {
		evt.target.classList.remove('occupied');
	}
}

/**
 * Handle an occupant being dragged onto a chair
 *
 * @param {DragEvent} evt
 * @param {Number} chairIdx Index of the target chair
 */
function onDropped(evt, chairIdx) {
	// Parse the occupant data stored in the data transfer
	const occupant = JSON.parse(evt.dataTransfer.getData('wedding-manager/occupant'));
	// Emit the setSeat event to tell the parent form that a new occupant is in the targetted seat
	emit('setSeat', { chairIdx, occupant });
}
</script>

<template>
	<div class="dining-container" :class="{ rectangle: style === 'rectangle' }">
		<div class="dining-table">
			<div class="flower">
				<div v-for="i in 5" :key="i" class="petal" />
				<div class="pistil" />
			</div>
			<div class="table-id" v-text="id" />
			<template v-for="(occupant, idx) in occupants" :key="idx">
				<info-popover
					:hint="hintText(occupant)"
					:opts="{
						selector: `#chair-${idx}`,
						container: 'body',
						html: true,
						placement: () => chairPopoverPlacement(idx)
					}"
				>
					<div
						:id="`chair-${idx}`"
						class="chair"
						:class="[
							{
								occupied: occupant?.name,
								draggable: edit && occupant?.name,
								'me-0': idx === occupants.length - 1,
								child: occupant?.child,
								active: hasSearchMatch(occupant)
							},
							(occupant?.status || '').toLowerCase().replace(' ', '-')
						]"
						:style="{ '--chair-rotation': chairTransform(idx) }"

						:draggable="edit && Boolean(occupant?.name)"
						@dragstart="evt => onDragStart(evt, occupant, idx)"
						@dragend="onDragEnd"
						@drag="onDragging"

						@dragenter.prevent="onDragEnter"
						@dragover.prevent="onDragOver"
						@dragleave.prevent="evt => onDragLeave(evt, idx)"
						@drop.prevent="evt => onDropped(evt, idx)"
					>
						<span class="drag-text" v-text="idx + 1" />
						<div class="plate" />
					</div>
				</info-popover>
			</template>
		</div>
	</div>
</template>

<style lang="scss" scoped>
$table-size: v-bind(tableSize);
$chair-size: v-bind(chairSize);
$chair-offset: v-bind(chairOffset);

// Custom animation to fade the chair in on load, and to slide it in towards the table relative to its position
@keyframes fade-slide-in {
	0% {
		opacity: 0;
		transform: translate(-50%, -50%) rotate(var(--chair-rotation)) translateY(calc($chair-offset * 1.33));
	}

	100% {
		opacity: 1;
		transform: translate(-50%, -50%) rotate(var(--chair-rotation)) translateY($chair-offset);
	}
}

// Custom animation to fade the chair in on load, and to slide it in towards the table relative to its position
@keyframes rectangle-fade-slide-in {
	0% {
		opacity: 0;
		transform: translate(0, 42%) translateY(calc($chair-offset * 1.33));
	}

	100% {
		opacity: 1;
		transform: translate(0, 42%) translateY($chair-offset);
	}
}

.dining-container {
	// Set a width and height that is large enough to contain the table and chairs
	width: v-bind(diameter);
	height: v-bind(diameter);

	// Add padding around the table with enough room to fit the chairs around the table
	padding: calc(1.5 * v-bind(chairSize));

	&.rectangle {
		padding-left: 0;
		padding-right: 0;
		height: calc(v-bind(diameter) * 0.5);
	}
}

.table-id {
	position: absolute;
	line-height: 0;
	top: 50%;
	text-align: center;
	width: 100%;

	.rectangle & {
		top: 80%;
	}
}

// Define the styling for the base table element
.dining-table {
	position: relative;

	// It is a simple fixes sized element
	width: $table-size;
	height: $table-size;

	// Which uses a simple border to mark its position
	border: 2px solid var(--bs-primary);

	// Rendered as a circle
	border-radius: 50%;

	.rectangle & {
		height: calc($table-size * 0.5);
		width: v-bind(diameter);
		border-radius: 2px;
		text-align: center;
	}
}

.chair {
	// Define base rotation variable to be overwritten by the `chairTransform()` function
	--chair-rotation: 0deg;

	position: absolute;

	// Each chair is a fixed size square
	width: $chair-size;
	height: $chair-size;

	// With a themed border as its outline with no fill colour
	border: 2px solid var(--bs-primary);

	// Slightly round the corners to make it look more appropriate
	border-radius: 15%;

	// Center the chair container
	top: 50%;
	left: 50%;

	// Use flex to center the chairs content
	display: flex;
	justify-content: center;
	align-items: center;

	// Set the positioning transform for the chair
	transform: translate(-50%, -50%) rotate(var(--chair-rotation)) translateY($chair-offset);

	// Add a transition to smoothly move the chair around the table when one is added or removed
	transition: transform 0.2s, background-color 0.2s;

	// And an animation to
	// Custom animation to fade the chair in on load, and to slide it in towards the table relative to its position fade and slide the chair towards the table
	animation: fade-slide-in 0.35s;

	.rectangle & {
		position: relative;
		display: inline-flex;
		top: initial;
		left: initial;
		margin-right: 0.4rem;
		transform: translate(0, 42%) translateY($chair-offset);
		animation: rectangle-fade-slide-in 0.35s;
	}

	.drag-text {
		z-index: 2;
	}

	// If the chair is selected then highlight it with a fill
	&.active {
		background-color: var(--bs-primary);
		border-color: var(--bs-primary-text-emphasis);
		color: var(--bs-dark);

		&::after {
			background-color: var(--bs-primary-border-subtle);
			border-color: var(--bs-primary-text-emphasis);
		}
	}

	&.draggable {
		cursor: grab;
	}

	&.occupied {
		&.attending::after {
			background-color: var(--bs-success);
		}

		&.tentative::after {
			background-color: var(--bs-warning-border-subtle);
		}

		&.pending::after {
			background-color: var(--bs-gray-400);
		}

		&.not-attending::after {
			background-color: var(--bs-danger-border-subtle);
		}

		&.child::after {
			background-color: var(--bs-info-border-subtle);
		}
	}

	// Apply the same fill on hover, though with the subtle background colour to differentiate it from active items
	&:not(.active):hover,
	&:not(.active).occupied {
		background-color: var(--bs-primary-border-subtle);
	}

	// Create the backrest for the chair
	&::after {
		content: '';
		position: absolute;
		border: 2px solid var(--bs-primary);
		border-radius: 15%;
		width: 130%;
		height: 25%;
		top: -25%;
	}
}

// Define styles for the table crockery and cutlery
.plate {
	position: absolute;

	// Use a double border for the plates to add the illusion of depth
	border: thick double var(--bs-primary);

	// Add a background colour matching the body so they render over the table during animation
	background-color: var(--bs-body-bg);
	border-radius: 50%;

	// Scale the plates to be slightly smaller than the chairs, which they are heirarchical children of
	width: 70%;
	height: 70%;
	top: 140%;

	// Apply a rotation to appropriately offset the glass
	transform: rotate(27deg);

	.active > & {
		background-color: var(--bs-primary-bg-subtle);
	}

	// Creates the glass that appears next to the plate on the table
	&::before {
		content: '';
		position: absolute;
		border: 2px double var(--bs-primary);
		border-radius: 50%;
		width: 60%;
		height: 60%;
		top: 165%;
	}

	// Creates the cutlery either side of the plate
	&::after {
		content: '';
		position: absolute;

		// Use a double border for the cutlery to give the impression of multiple courses worth
		border: 2px double var(--bs-primary);

		// Making the top/bottom borders transparent, coupled with the doubled border, gives the
		// impression of different sizing to the cutlery while using a single element
		border-top-color: transparent;
		border-bottom-color: transparent;

		// Scale the pseudo element to be appropriately positioned around the plate
		width: 250%;
		height: 115%;
		top: -12%;
		left: -75%;

		// Apply an inverse transform on the cutlery to align them back centred to the chair
		transform: rotate(-27deg);
	}
}

// Add a flower to the centre of the table to make it less bare
.flower {
	// Scale the flower the same as the chair base
	width: $chair-size;
	height: $chair-size;

	// And make it opaque to make it not draw as much attention
	opacity: 0.5;

	.petal {
		// Scale the petals relative to the chairs
		$petal-height: calc($chair-size * 0.3);
		$petal-width: calc($chair-size * 0.25);

		position: absolute;
		top: calc(50% - calc($petal-height * 0.5));
		height: $petal-height;
		left: calc(50% - calc($petal-width * 0.5));
		width: $petal-width;

		// Theme them with the primary colour
		background-color: var(--bs-primary);

		// Use an elliptical shape for the petals
		border-radius: 50% / 100%;

		.rectangle & {
			top: calc(80% - calc($petal-height * 0.5));
		}

		// Position and rotate individual petals.
		// These are always static so no need to define the transformations programmatically
		&:nth-child(1) { transform: rotate(0deg) translate(0, calc($chair-size * -0.2)); }
		&:nth-child(2) { transform: rotate(72deg) translate(0, calc($chair-size * -0.2)); }
		&:nth-child(3) { transform: rotate(144deg) translate(0, calc($chair-size * -0.2)); }
		&:nth-child(4) { transform: rotate(216deg) translate(0, calc($chair-size * -0.2)); }
		&:nth-child(5) { transform: rotate(288deg) translate(0, calc($chair-size * -0.2)); }
	}

	// Position and display the pistil central to the flower with a contrasting colour
	.pistil {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: calc($chair-size * 0.2);
		height: calc($chair-size * 0.2);
		background-color: var(--bs-secondary);
		border-radius: 50%;

		.rectangle & {
			top: 80%;
		}
	}
}
</style>
