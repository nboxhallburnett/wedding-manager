<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
	caption: { type: String, default: '' },
	columns: { type: Array, required: true },
	items: { type: [ Array, Object ], required: true },
	actions: { type: Function, default: null },
	search: { type: Function, default: null },
	suggestions: { type: [ Array, Object ], default: null }
});

const searchTerm = ref('');
const currentSort = ref({ col: '', dir: 1, fn: null });

const filteredItems = computed(() => {
	const term = searchTerm.value.trim();
	if (!props.search || !term) {
		return props.items;
	}
	return props.items.filter(item => props.search(item, term));
});

const displayedItems = computed(() => {
	if (!currentSort.value.col) {
		return filteredItems.value;
	}
	return Array.from(filteredItems.value).sort(currentSort.value.fn);
});

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
				{{ displayedItems.length !== items.length ? `${displayedItems.length} of ${items.length}` : displayedItems.length }} {{ caption }}{{ items.length !== 1 ? 's' : '' }}
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
							'sortable': col.sort,
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
				<tr v-for="item in displayedItems" :key="item.id">
					<slot :item />
					<td v-if="actions" class="text-end py-1 align-middle">
						<button
							:id="`table-${item.id}-actions`"
							class="icon-caret fs-4 p-0"
							type="button"
							data-bs-toggle="dropdown"
							aria-expanded="false"
						/>
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

<style lang="scss" scoped>
.sortable {
	cursor: pointer;

	&:hover {
		background-color: var(--bs-table-active-bg);
	}
}

.table-active.table-active-flip > .icon-caret {
	transform: rotate(180deg);
}
</style>
