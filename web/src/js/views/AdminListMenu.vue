<script setup>
import { inject, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { useForm } from 'composables/form';
import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';
import DietIndicator from 'components/DietIndicator.vue';

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
</script>

<template>
	<div class="card-body">
		<card-header title="Menu Items" :action="{ text: 'New Item', to: { name: 'Admin Create Menu Item' } }" />
		<div class="card-text">
			<table class="table table-hover mt-1">
				<thead>
					<tr>
						<th scope="col">
							Title
						</th>
						<th scope="col">
							Course
						</th>
						<th scope="col">
							Menu
						</th>
						<th scope="col">
							Diet
						</th>
						<th scope="col">
							Chosen
						</th>
						<th scope="col" class="text-end">
							Actions
						</th>
					</tr>
				</thead>
				<tbody>
					<template v-for="item in menu" :key="item.id">
						<tr>
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
							<td class="text-end py-1 align-middle">
								<button
									:id="`menu-item-${item.id}-actions`"
									class="icon-caret fs-4 p-0"
									type="button"
									data-bs-toggle="dropdown"
									aria-expanded="false"
								/>
								<ul class="dropdown-menu" :aria-labelledby="`menu-item-${item.id}-actions`">
									<li>
										<router-link class="dropdown-item" :to="{ name: 'Admin View Menu Item', params: { menuItemId: item.id } }">
											View
										</router-link>
									</li>
									<li>
										<router-link class="dropdown-item" :to="{ name: 'Admin Edit Menu Item', params: { menuItemId: item.id } }">
											Edit
										</router-link>
									</li>
									<li><hr class="dropdown-divider"></li>
									<li>
										<button class="dropdown-item text-danger" type="button" @click="deleteItem(item)">
											Delete
										</button>
									</li>
								</ul>
							</td>
						</tr>
					</template>
				</tbody>
			</table>
		</div>
	</div>
</template>
