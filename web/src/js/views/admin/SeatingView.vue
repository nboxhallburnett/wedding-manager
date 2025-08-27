<script setup>
import { inject, ref } from 'vue';
import { nanoid } from 'nanoid';

import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';
import CustomHR from 'components/CustomHR.vue';
import DiningTable from 'components/DiningTable.vue';

const invitation = inject('invitation');

const tables = ref([]);
const searchTerm = ref('');
const searchSuggestions = ref([]);

useLoader([
	'seating?enrich=true',
	invitation.value?.admin ? 'menu' : undefined
].filter(Boolean), ([ seatingResponse, menuResponse ]) => {
	const menuItems = menuResponse?.result.data.reduce((items, item) => {
		items[item.id] = item.title;
		return items;
	}, {}) || {};

	// Set the search suggestions to be the list of table occupant names
	searchSuggestions.value = seatingResponse.result.data.flatMap(table => table.map(table => table.name))
		.concat(...Object.values(menuItems))
		.filter(Boolean);

	// Add an id for vue to track each table item with
	tables.value = (seatingResponse.result.data || []).map(guests => ({
		id: nanoid(),
		guests: guests.map(guest => {
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
	<div class="card-body">
		<card-header title="Seating Plan" :back="{ name: 'Admin Overview' }" :action="{ text: 'Edit Seating Plan', to: { name: 'Admin Edit Seating Plan' } }" />
		<div class="card-text">
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
					class="d-flex justify-content-center"
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
			<custom-h-r />
			<div class="row">
				<div v-for="(table, idx) in tables" :key="table.id" class="col-6 col-md-4 col-lg-3">
					<b class="d-block">Table {{ idx + 1 }}</b>
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
		</div>
	</div>
</template>
