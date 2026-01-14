<script setup>
import { computed, ref } from 'vue';

import Router from 'router';

const props = defineProps({
	caption: { type: String, default: '' },
	columns: { type: Array, required: true },
	items: { type: [ Array, Object ], required: true },
	actions: { type: Function, default: null },
	search: { type: Function, default: null },
	suggestions: { type: [ Array, Object ], default: null },
	rowClass: { type: [ Function, String ], default: null }
});

const displayedPage = ref(0);
const perPage = ref(10);
const perPageOptions = [ 5, 10, 25, 50, 100 ];

const searchTerm = ref(Router.currentRoute.value.query?.term || '');
const currentSort = ref({ col: '', dir: 1, fn: null });

// Clear any term that was supplied on load
Router.replace({ query: { ...Router.currentRoute.value.query, term: undefined } });

// Constructs a copy of the provided data after applying any requested filters
const filteredItems = computed(() => {
	const term = searchTerm.value.trim();
	if (!props.search || !term) {
		return props.items;
	}
	return props.items.filter(item => props.search(item, term));
});

// Constructs a copy of the filtered data that has been sorted by any requested sort function
const sortedItems = computed(() => {
	if (!currentSort.value.col) {
		return filteredItems.value;
	}
	return Array.from(filteredItems.value).sort(currentSort.value.fn);
});

// Constructs a copy of the sorted data that has been split into whichever subset will fit on the currently selected page
const displayedItems = computed(() => {
	if (perPage.value >= sortedItems.value.length) {
		return sortedItems.value;
	}
	const initialIdx = displayedPage.value * perPage.value;
	return sortedItems.value.slice(initialIdx, initialIdx + perPage.value);
});

// Keeps track of the total number of pages
const pages = computed(() => Math.ceil(sortedItems.value.length / perPage.value));

// Constructs the displayed table's caption text
const captionText = computed(() => {
	const itemText = `${props.caption}${props.items.length !== 1 ? 's' : ''}`;
	const filteredText = filteredItems.value.length !== props.items.length
		? `${filteredItems.value.length}/${props.items.length}`
		: props.items.length;

	if (pages.value > 1) {
		const initialIdx = displayedPage.value * perPage.value;
		return `${initialIdx + 1} - ${Math.min(initialIdx + perPage.value, filteredItems.value.length)} of ${filteredText} ${itemText}`;
	}

	return `${filteredText} ${itemText}`;
});

/**
 * Sets the current sort based on a selected column and the current sort direction
 *
 * @param col Column definition to sort by
 */
function sort(col) {
	if (!col.sort) {
		return;
	}
	const dir = currentSort.value.col === col.id ? (-1 * currentSort.value.dir) : 1;
	currentSort.value = {
		fn: (a, b) => col.sort(a, b, dir),
		col: col.id,
		dir
	};
}

/**
 * Navigate to the page prior to the one currently displayed
 */
function previousPage() {
	// Don't attempt to go to an earlier page if we're on the first page already
	if (displayedPage.value <= 0) {
		return;
	}
	displayedPage.value = displayedPage.value - 1;
}

/**
 * Navigate to the page after to the one currently displayed
 */
function nextPage() {
	// Don't attempt to go to an earlier page if we're on the first page already
	if (displayedPage.value >= pages.value - 1) {
		return;
	}
	displayedPage.value = displayedPage.value + 1;
}
</script>

<template>
	<div v-if="search" class="">
		<input
			v-model="searchTerm"
			class="form-control mx-auto w-75"
			placeholder="Search"
			:list="(suggestions?.value?.length || suggestions?.length) && 'searchSuggestions' || undefined"
			@keyup.escape="searchTerm = ''"
		>
		<datalist v-if="suggestions?.value?.length || suggestions?.length" id="searchSuggestions">
			<option v-for="item in suggestions?.value || suggestions" :key="item" :value="item" />
		</datalist>
	</div>
	<div class="table-responsive">
		<table class="table table-hover mt-1">
			<caption v-if="caption" class="text-nowrap">
				<span v-text="captionText" />

				<div class="float-end">
					<nav v-if="pages > 1" class="d-inline-flex" aria-label="Table pagination controls">
						<ul class="pagination pagination-sm">
							<li class="page-item" :class="{ disabled: displayedPage === 0 }" @click.prevent.stop="previousPage">
								<a class="page-link" href="#" aria-label="Previous">
									<span aria-hidden="true">&laquo;</span>
								</a>
							</li>
							<li v-for="idx in pages" :key="idx" class="page-item">
								<a
									class="page-link"
									:class="{ active: displayedPage === idx - 1 }"
									href="#"
									@click.prevent.stop="displayedPage = idx - 1"
									v-text="idx"
								/>
							</li>
							<li class="page-item" :class="{ disabled: displayedPage === pages - 1 }" @click.prevent.stop="nextPage">
								<a class="page-link" href="#" aria-label="Next">
									<span aria-hidden="true">&raquo;</span>
								</a>
							</li>
						</ul>
					</nav>
					<select
						id="table-per-page"
						v-model="perPage"
						class="btn btn-sm ps-0"
						aria-label="Table pagination per-page selection"
					>
						<template v-for="option of perPageOptions" :key="option">
							<option :value="option" v-text="`${option} per page`" />
						</template>
					</select>
				</div>
			</caption>
			<thead>
				<tr>
					<th
						v-for="col in columns"
						:key="col.id"
						scope="col"
						class="text-nowrap"
						:role="col.sort && 'button' || undefined"
						:class="[ col.class, {
							'col-sortable': col.sort,
							'table-active': currentSort.col === col.id,
							'table-active-flip': currentSort.col === col.id && currentSort.dir === 1
						} ]"
						@click="sort(col)"
					>
						<span v-text="col.text" />
						<span v-if="col.sort" class="icon-caret d-inline-block ms-1" />
					</th>
					<th v-if="actions" scope="col" class="text-end">
						Actions
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="item in displayedItems" :key="item.id" :class="typeof rowClass === 'function' ? rowClass(item) : rowClass">
					<slot :item />
					<td v-if="actions" class="text-end py-1 align-middle">
						<button
							v-if="actions(item).length"
							:id="`table-${item.id}-actions`"
							class="icon-caret fs-4 p-0"
							type="button"
							data-bs-toggle="dropdown"
							aria-expanded="false"
						>
							<div class="visually-hidden">
								Open Actions Dropdown
							</div>
						</button>
						<ul class="dropdown-menu" :aria-labelledby="`table-${item.id}-actions`">
							<li v-for="(action, actionIdx) in actions(item)" :key="actionIdx">
								<router-link
									v-if="action.to"
									class="dropdown-item"
									:to="action.to"
									:class="action.class"
								>
									{{ action.text }}
								</router-link>
								<button
									v-else-if="action.onClick"
									class="dropdown-item"
									:class="action.class"
									@click.prevent="action.onClick"
									v-text="action.text"
								/>
								<hr v-else-if="action.divider" class="dropdown-divider">
							</li>
						</ul>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style lang="scss">
.col-sortable {
	cursor: pointer;

	&:hover {
		background-color: var(--bs-table-active-bg);
	}
}

.table-active.table-active-flip > .icon-caret {
	transform: rotate(180deg);
}

.table-warning .icon-caret {
	filter: none;
}
</style>
