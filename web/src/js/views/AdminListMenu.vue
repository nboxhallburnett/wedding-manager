<script setup>
import { inject, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { useForm } from 'composables/form';
import { useLoader } from 'composables/loader';

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
	columns: [
		{ id: 'title', text: 'Title' },
		{ id: 'course', text: 'Course' },
		{ id: 'menu', text: 'Menu' },
		{ id: 'diet', text: 'Diet' },
		{ id: 'chosen', text: 'Chosen' }
	],
	search(item, term) {
		// Match on the menu item ID
		if (item.id === term) {
			return true;
		}
		if (item.title.toLowerCase().includes(term.toLowerCase())) {
			return true;
		}
		if (item.description.toLowerCase().includes(term.toLowerCase())) {
			return true;
		}
		if (courseText[item.course].toLowerCase().includes(term.toLowerCase())) {
			return true;
		}
		// Otherwise, no match
		return false;
	},
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
	<div class="card-body">
		<card-header title="Menu Items" :action="{ text: 'New Item', to: { name: 'Admin Create Menu Item' } }" />
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
						Full: {{ stats.adult[item.id] || 0 }} |
						Junior: {{ stats.child[item.id] || 0 }}
					</template>
					<template v-else>
						Child: {{ stats.child[item.id] || 0 }}
					</template>
				</td>
			</table-component>
		</div>
	</div>
</template>
