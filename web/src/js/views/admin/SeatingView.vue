<script setup>
import { computed, inject, ref, nextTick } from 'vue';
import { RouterLink } from 'vue-router';

import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';
import CardBody from 'components/CardBody.vue';
import CustomHR from 'components/CustomHR.vue';
import DiningTable from 'components/DiningTable.vue';

const invitation = inject('invitation');

/** @type {Ref<DiningRoom>} */
const seating = ref({
	ratio: 1,
	scale: 1,
	tables: []
});
const searchTerm = ref('');
const searchSuggestions = ref([]);

const ratio = computed(() => seating.value.ratio);
const scale = computed(() => seating.value.scale);

useLoader([
	'seating?enrich=true',
	invitation.value?.admin ? 'menu' : undefined
].filter(Boolean), ([ seatingResponse, menuResponse ]) => {
	const menuItems = menuResponse?.result.data.reduce((items, item) => {
		items[item.id] = item.title;
		return items;
	}, {}) || {};

	// Set the search suggestions to be the list of table occupant names
	searchSuggestions.value = seatingResponse.result.data.tables?.flatMap(table => table.guests?.map(guest => guest.name))
		.concat(...Object.values(menuItems))
		.filter(Boolean);

	seating.value = {
		...seatingResponse.result.data,
		scale: seatingResponse.result.data?.scale || 1,
		ratio: seatingResponse.result.data?.ratio || 1,
		tables: (seatingResponse.result.data?.tables || []).map(table => ({
			...table,
			guests: (table.guests || []).map(guest => {
				if (!menuResponse) {
					return guest;
				}
				guest.starter = menuItems[guest.starter_id];
				guest.main = menuItems[guest.main_id];
				guest.dessert = menuItems[guest.dessert_id];
				delete guest.starter_id;
				delete guest.main_id;
				delete guest.dessert_id;
				return guest;
			})
		}))
	};
});

/**
 * Returns whether a given guest matches the current search term
 *
 * @param {DiningTableSeat} guest
 * @returns {Boolean}
 */
function hasSearchMatch(guest) {
	if (!searchTerm.value) {
		return false;
	}
	return guest?.name === searchTerm.value;
}

/**
 * Attempts to focus any matches for the current search term
 */
async function onSearch(term) {
	// If provided a term, set it
	if (term && typeof term === 'string') {
		searchTerm.value = term;
		await new Promise(resolve => nextTick(() => resolve()));
	}
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
</script>

<template>
	<card-body>
		<card-header title="Seating Plan">
			<router-link class="btn btn-link btn-sm me-2" :to="{ name: 'Admin Overview' }">
				Back
			</router-link>
			<router-link class="btn btn-primary btn-sm me-2" :to="{ name: 'Admin Edit Seating Plan' }">
				Edit Seating Plan
			</router-link>
			<router-link class="btn btn-primary btn-sm me-2" :to="{ name: 'Admin Edit Seating Layout' }">
				Edit Seating Layout
			</router-link>
		</card-header>
		<div class="card-text">
			<input
				v-model="searchTerm"
				class="form-control mx-auto w-75 mb-3"
				placeholder="Search"
				:list="searchSuggestions.length && 'searchSuggestions' || undefined"
				@keyup.escape="searchTerm = ''"
				@keydown.enter.prevent="() => onSearch()"
			>
			<datalist v-if="searchSuggestions.length" id="searchSuggestions">
				<option v-for="item in searchSuggestions" :key="item" :value="item" />
			</datalist>
			<div id="room-container">
				<div
					v-for="(table, idx) in seating.tables"
					:key="table.id"
					class="table-container"
					:style="{ '--table-x': (table.x || 0) + '%', '--table-y': (table.y || 0) + '%' }"
				>
					<dining-table
						:id="String(idx + 1)"
						:occupants="table.guests"
						:search-term
						:style="idx === 0 ? 'rectangle' : undefined"
						:rotation="Number(table.rotation || 0)"
						class="d-inline-block"
					/>
				</div>
			</div>
			<custom-h-r />
			<div class="row">
				<div v-for="(table, idx) in seating.tables" :key="table.id" class="col-6 col-md-4 col-lg-3">
					<b class="d-block">Table {{ idx + 1 }}</b>
					<ol class="d-inline-block">
						<li
							v-for="(guest, guestIdx) in table.guests"
							:key="guestIdx"
							:class="{ 'fw-bold': hasSearchMatch(guest), 'text-muted': !guest?.name }"
						>
							<a
								v-if="guest?.name"
								href="#"
								class="text-body text-decoration-none"
								@click.prevent="() => onSearch(guest.name)"
								v-text="guest.name"
							/>
							<span v-else v-text="'Unassigned'" />
						</li>
					</ol>
				</div>
			</div>
		</div>
	</card-body>
</template>

<style lang="scss" scoped>
$room-ratio: v-bind(ratio);
$table-scale: v-bind(scale);

#room-container {
	position: relative;
	width: 100%;
	aspect-ratio: 1 / $room-ratio;
	padding: 0;
}

.table-container {
	width: auto;
	height: auto;
	position: absolute;
	left: var(--table-x);
	top: var(--table-y);
	transform: scale($table-scale);
}
</style>
