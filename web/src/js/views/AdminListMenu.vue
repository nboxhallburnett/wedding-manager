<script setup>
import { inject, ref } from 'vue';
import { RouterLink } from 'vue-router';

import API from 'lib/api';
import DietIndicator from 'components/DietIndicator.vue';

/** @type {Ref<MenuItem[]>} */
const menu = ref([]);
/** @type {Ref<Boolean>} */
const loading = inject('loading');
/** @type {AddToast} */
const addToast = inject('addToast');
const stats = ref({ adult: {}, child: {} });

const courseText = [ 'Starter', 'Main', 'Dessert' ];

loading.value = true;
Promise.all([
	// If this is the admin edit, fetch the invitation from the API, otherwise we can use the session
	API('menu'),
	API('admin/stats/menu')
]).then(([ menuResult, menuStats ]) => {
	menu.value = menuResult.result.data;
	stats.value.adult = menuStats.result.data.adult;
	stats.value.child = menuStats.result.data.child;
	loading.value = false;
}).catch(() => loading.value = false);

async function deleteItem(menuItem) {
	loading.value = true;
	await API(`menu/${menuItem.id}`, { method: 'delete' });
	menu.value = await API('menu').then(({ result }) => result.data);
	addToast({
		title: 'Menu Item Removed',
		body: `Menu item "${menuItem.title}" (${menuItem.id}) successfully removed.`
	});
	loading.value = false;
}
</script>

<template>
	<div class="card-body">
		<h4 class="card-title d-flex justify-content-between">
			<span>
				Menu Items
			</span>
			<router-link class="btn btn-primary btn-sm" :to="{ name: 'Admin Create Menu Item' }">
				New Item
			</router-link>
		</h4>
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
								<diet-indicator :vegan="item.vegan" :vegetarian="item.vegetarian" :gluten-free="item.gluten_free" />
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
