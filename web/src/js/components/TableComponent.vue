<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
	columns: { type: Array, required: true },
	items: { type: [ Array, Object ], required: true },
	actions: { type: Function, default: null },
	search: { type: Function, default: null }
});

const searchTerm = ref('');

const filteredItems = computed(() => {
	const term = searchTerm.value.trim();
	if (!props.search || !term) {
		return props.items;
	}
	return props.items.filter(item => props.search(item, term));
});
</script>

<template>
	<div v-if="search" class="">
		<input v-model="searchTerm" class="form-control mx-auto w-75" placeholder="Search">
	</div>
	<div class="table-responsive-sm">
		<table class="table table-hover mt-1">
			<thead>
				<tr>
					<th
						v-for="col in columns"
						:key="col.id"
						scope="col"
						:class="col.class"
					>
						{{ col.text }}
					</th>
					<th v-if="actions" scope="col" class="text-end">
						Actions
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="item in filteredItems" :key="item.id">
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
