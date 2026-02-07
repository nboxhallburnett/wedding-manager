<script setup>
import { inject, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { normaliseString } from 'lib/formatter.js';

import { useForm } from 'composables/form';
import { useLoader } from 'composables/loader';

import CardBody from 'components/CardBody.vue';
import CardHeader from 'components/CardHeader.vue';
import DietIndicator from 'components/DietIndicator.vue';
import TableComponent from 'components/TableComponent.vue';

/** @type {Ref<MenuItem[]>} */
const menu = ref([]);

/** @type {AddToast} */
const addToast = inject('addToast');

const stats = ref({ adult: {}, child: {} });
const courseText = [ 'Starter', 'Main', 'Dessert' ];

// Fetch the menu and the associated stats
useLoader([ 'menu', 'admin/stats/menu' ], [ menu, stats ]);

const { onSubmit: deleteItem } = useForm({
	method: 'DELETE',
	path: menuItem => `menu/${menuItem.id}`,
	onSuccess(_data, _response, menuItem) {
		addToast({
			title: 'Menu Item Removed',
			body: `Menu item "${menuItem.title}" (${menuItem.id}) successfully removed.`
		});
		// Refetch the menu items for the table
		useLoader('menu', menu);
	}
});

const tableOpts = {
	caption: 'Menu Item',
	columns: [
		{ id: 'title', text: 'Title', sort(a, b, dir) {
			const titleA = a.title?.toUpperCase();
			const titleB = b.title?.toUpperCase();
			if (titleA < titleB) {
				return dir * -1;
			}
			if (titleA > titleB) {
				return dir * 1;
			}
			return 0;
		} },
		{ id: 'course', text: 'Course', sort(a, b, dir) {
			return ((a?.course || 0) - (b?.course || 0)) * dir;
		} },
		{ id: 'menu', text: 'Menu', sort(a, b, dir) {
			return (Number(a?.child) - (Number(b?.child))) * dir;
		} },
		{ id: 'diet', text: 'Diet' },
		{ id: 'chosen', text: 'Chosen', sort(a, b, dir) {
			// Convert the two counts to padded number strings to sort using. JS sorting is weird.
			const aCount = String(stats.value.adult[a.id] || 0).padStart(4, '0')
				+ String(stats.value.child[a.id] || 0).padStart(4, '0');
			const bCount = String(stats.value.adult[b.id] || 0).padStart(4, '0')
				+ String(stats.value.child[b.id] || 0).padStart(4, '0');
			if (aCount < bCount) {
				return dir * -1;
			}
			if (aCount > bCount) {
				return dir * 1;
			}
			return 0;
		} }
	],
	search(item, term) {
		const normalisedTerm = normaliseString(term).toLowerCase();
		// Match on the menu item ID
		if (normaliseString(item.id) === normalisedTerm) {
			return true;
		}
		if (normaliseString(item.title).toLowerCase().includes(normalisedTerm)) {
			return true;
		}
		if (normaliseString(item.description).toLowerCase().includes(normalisedTerm)) {
			return true;
		}
		if (courseText[item.course].toLowerCase().includes(normalisedTerm)) {
			return true;
		}
		// Otherwise, no match
		return false;
	},
	suggestions: courseText,
	actions(item) {
		if (!item.id) {
			return [];
		}
		return [
			{ text: 'View', to: { name: 'Admin View Menu Item', params: { menuItemId: item.id } } },
			{ text: 'Edit', to: { name: 'Admin Edit Menu Item', params: { menuItemId: item.id } } },
			{ divider: true },
			{ text: 'Delete', onClick: () => deleteItem(item), class: 'text-danger' }
		];
	}
};
</script>

<template>
	<card-body>
		<card-header title="Menu Items">
			<router-link class="btn btn-link btn-sm me-2" :to="{ name: 'Admin Overview' }">
				Back
			</router-link>
			<router-link class="btn btn-primary btn-sm me-2" :to="{ name: 'Admin View Menu Card' }">
				Export
			</router-link>
			<router-link class="btn btn-primary btn-sm" :to="{ name: 'Admin Create Menu Item' }">
				New Item
			</router-link>
		</card-header>
		<div class="card-text">
			<table-component v-slot="{ item }" :items="menu" v-bind="tableOpts">
				<th scope="row">
					<router-link :to="{ name: 'Admin View Menu Item', params: { menuItemId: item.id } }">
						{{ item.title }}
					</router-link>
				</th>
				<td v-text="courseText[item.course]" />
				<td v-text="item.child ? 'Child' : 'Adult'" />
				<td>
					<diet-indicator :item />
				</td>
				<td>
					<template v-if="!item.child">
						Full: {{ stats.adult?.[item.id] || 0 }} |
						Junior: {{ stats.child?.[item.id] || 0 }}
					</template>
					<template v-else>
						Child: {{ stats.child?.[item.id] || 0 }}
					</template>
				</td>
			</table-component>
		</div>
	</card-body>
</template>
