<script setup>
import { inject, ref } from 'vue';
import Router from 'router';

import FormText from 'components/form/FormText.vue';
import DietIndicator from 'components/DietIndicator.vue';
import API from 'lib/api';

/** @type {Ref<Boolean>} */
const loading = inject('loading');
/** @type {Ref<MenuItem>} */
const item = ref({});

// Define available course options
const courseOptions = [ 'Starter', 'Main', 'Dessert' ];
const menuOptions = [ 'Adult', 'Children' ];

loading.value = true;
API(`menu/${Router.currentRoute.value.params.menuItemId}`).then(({ result }) => {
	item.value = result.data;
	loading.value = false;
}).catch(() => loading.value = false);
</script>

<template>
	<div class="card-body">
		<h4 class="card-title d-flex justify-content-between">
			<span>
				Menu Item
			</span>
			<router-link class="btn btn-primary btn-sm" :to="{ name: 'Admin Edit Menu Item', params: $route.params }">
				Update Menu Item
			</router-link>
		</h4>
		<hr>
		<form-text
			v-model="item.title"
			name="title"
			label="Title"
		>
			<template #after>
				<diet-indicator :vegan="item.vegan" :vegetarian="item.vegetarian" :gluten-free="item.gluten_free" />
			</template>
		</form-text>
		<form-text
			v-model="item.description"
			name="description"
			label="Description"
		/>
		<form-text
			:value="courseOptions[item.course]"
			name="course"
			label="Course"
		/>
		<form-text
			:value="menuOptions[Number(item.child)]"
			name="child"
			label="Menu"
		/>
	</div>
</template>
