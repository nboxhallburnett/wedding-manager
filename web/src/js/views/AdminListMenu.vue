<script setup>
import { inject, ref } from 'vue';
import { RouterLink } from 'vue-router';

import API from 'lib/api';
import DietIndicator from 'components/DietIndicator.vue';

const menu = ref([]);
const loading = inject('loading');
const addToast = inject('addToast');

const courseText = [ 'Starter', 'Main', 'Dessert' ];

loading.value = true;
API('menu').then(({ result }) => {
	menu.value = result.data;
	loading.value = false;
}).catch(() => loading.value = false);

async function deleteItem(menuItem) {
	loading.value = true;
	await API(`menu/${menuItem.id}`, { method: 'delete' });
	menu.value = await API('menu').then(({ result }) => result.data);
	addToast({
		title: 'Menu Item Removed',
		body: `Menu item ${menuItem.title} (${menuItem.id}) successfully removed.`
	});
	loading.value = false;
}
</script>

<template>
	<div class="card-body">
		<h5 class="card-title d-flex justify-content-between">
			<span>
				Menu Items
			</span>
			<router-link class="btn btn-primary btn-sm" :to="{ name: 'Admin Create Menu Item' }">
				New Item
			</router-link>
		</h5>
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
