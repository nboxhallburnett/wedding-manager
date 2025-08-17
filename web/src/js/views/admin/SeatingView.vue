<script setup>
import { ref } from 'vue';
import { nanoid } from 'nanoid';

import { useLoader } from 'composables/loader';
// import { statusMessages } from 'lib/formatter';

import CardHeader from 'components/CardHeader.vue';
import DiningTable from 'components/DiningTable.vue';

const tables = ref([]);
const searchTerm = ref('');
const searchSuggestions = ref([]);

useLoader('seating?enrich=true', seatingResponse => {
	// Set the search suggestions to be the list of table occupant names
	searchSuggestions.value = seatingResponse.result.data.flatMap(table => table.map(table => table.name)).filter(Boolean);

	// Add an id for vue to track each table item with
	tables.value = (seatingResponse.result.data || []).map(guests => ({
		id: nanoid(),
		guests
	}));
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
</script>

<template>
	<card-header title="Seating Plan" />
	<form class="card-text">
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
		<div class="row justify-content-center">
			<div
				v-for="(table, idx) in tables"
				:key="table.id"
				class="text-center"
				:class="idx ? 'col-6' : 'col-12'"
			>
				<dining-table
					:id="String(idx + 1)"
					:occupants="table.guests"
					:search-term
					:style="idx === 0 ? 'rectangle' : undefined"
					class="d-inline-block"
				/>
			</div>
		</div>
		<hr class="fancy-hr">
		<div class="row">
			<div v-for="(table, idx) in tables" :key="table.id" class="col-3">
				<div>Table: {{ idx + 1 }}</div>
				<ol class="d-inline-block">
					<li
						v-for="(guest, guestIdx) in table.guests"
						:key="guestIdx"
						:class="{ 'fw-bold': hasSearchMatch(guest), 'text-muted': !guest?.name }"
						v-text="guest?.name || 'Unassigned'"
					/>
				</ol>
			</div>
		</div>
	</form>
</template>
