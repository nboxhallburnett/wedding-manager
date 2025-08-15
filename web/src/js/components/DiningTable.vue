<script setup>
import { ref } from 'vue';

import InfoPopover from './InfoPopover.vue';
import { escapeHtml } from 'lib/formatter';

const props = defineProps({
	id: { type: String, default: '' },
	occupants: { type: Array, default: () => [] }
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

	return `<b>Name</b>: ${escapeHtml(occupant.name)}
		<br><b>ID</b>: <span class="font-monospace">${occupant.id}</span>
		<br>${occupant.child ? 'Child' : `<b>Status</b>: ${occupant.status}`}`;
}

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
	<div class="dining-container">
		<div class="table">
			<div class="flower">
				<div v-for="i in 5" :key="i" class="petal" />
				<div class="pistil" />
			</div>
			<div class="table-id" v-text="id" />
			<template v-for="(occupant, idx) in occupants" :key="idx">
				<info-popover :hint="hintText(occupant)" :opts="{ selector: `#chair-${idx}`, html: true }">
					<div
						:id="`chair-${idx}`"
						class="chair"
						:class="[ { occupied: occupant?.name, child: occupant?.child }, (occupant?.status || '').toLowerCase().replace(' ', '-') ]"
						:style="{ '--chair-rotation': chairTransform(idx) }"
						@dragenter.prevent="onDragEnter"
						@dragover.prevent="onDragOver"
						@dragleave.prevent="evt => onDragLeave(evt, idx)"
						@drop.prevent="evt => onDropped(evt, idx)"
					>
						{{ idx + 1 }}
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

.dining-container {
	// Set a width and height that is large enough to contain the table and chairs
	width: v-bind(diameter);
	height: v-bind(diameter);

	// Add padding around the table with enough room to fit the chairs around the table
	padding: calc(1.5 * v-bind(chairSize));
}

.table-id {
	position: absolute;
	line-height: 0;
	top: 50%;
	text-align: center;
	width: 100%;
}

// Define the styling for the base table element
.table {
	position: relative;

	// It is a simple fixes sized element
	width: $table-size;
	height: $table-size;

	// Which uses a simple border to mark its position
	border: 2px solid var(--bs-primary);

	// Rendered as a circle
	border-radius: 50%;
}

.chair {
	// Define base rotation variable to be overwritten by the `chairTransform()` function
	--chair-rotation: 0deg;

	// Set an appropriate cursor styling for the chair content
	cursor: context-menu;
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

	// If the chair is selected then highlight it with a fill
	&.active {
		background-color: var(--bs-primary);
		color: var(--bs-dark);

		&::after {
			background-color: var(--bs-primary-border-subtle);
		}
	}

	&.occupied {
		&.attending::after {
			background-color: var(--bs-success);
		}

		&.tentative::after {
			background-color: var(--bs-warning-border-subtle)
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
	transform: rotate(40deg);

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
		transform: rotate(-40deg);
	}
}

// Add a flower to the centre of the table to make it less bare
.flower {
	// Scale the flower the same as the chair base
	width: $chair-size;
	height: $chair-size;

	// Center it on the table
	top: 50%;
	left: 50%;

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

		// Position and rotate individual petals. These are always static so no need to define the transformations programmatically
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
	}
}
</style>
