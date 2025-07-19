<script setup>
import { inject, ref, watch } from 'vue';
import Router from 'router';

import FormInput from 'components/form/FormInput.vue';
import FormSelect from 'components/form/FormSelect.vue';
import FormTextarea from 'components/form/FormTextarea.vue';
import FormSwitch from 'components/form/FormSwitch.vue';
import API from 'lib/api';

const addToast = inject('addToast');
const loading = inject('loading');
const item = ref({
	child: false,
	course: 0,
	title: '',
	description: '',
	vegan: false,
	vegetarian: false,
	gluten_free: false
});

// Define available course options
const courseOptions = [
	{ text: 'Starter', value: 0 },
	{ text: 'Main', value: 1 },
	{ text: 'Dessert', value: 2 }
];
const menuOptions = [
	{ text: 'Adult', value: false },
	{ text: 'Children', value: true }
];

// Define var to track whether the component is being used for a create or update operation
const isNew = Router.currentRoute.value.name.includes('Create');

if (!isNew) {
	loading.value = true;
	API(`menu/${Router.currentRoute.value.params.menuItemId}`).then(({ result }) => {
		item.value = result.data;
		loading.value = false;
	}).catch(() => loading.value = false);
}

watch(() => item.value.vegan, value => {
	// If an item is vegan, it is also vegetarian
	if (value) {
		item.value.vegetarian = true;
	}
});

async function onSubmit() {
	loading.value = true;
	if (isNew) {
		await API('menu', {
			method: 'POST',
			body: item
		});
	} else {
		await API(`menu/${item.value.id}`, {
			method: 'PUT',
			body: item
		});
	}
	addToast({
		title: `Menu Item ${isNew ? 'Created' : 'Updated'}`,
		body: isNew
			? `Menu Item ${item.value.title} successfully created.`
			: `Menu Item ${item.value.title} successfully updated.`
	});
	loading.value = false;
	Router.push({ name: 'Admin List Menu Items' });
}
</script>

<template>
	<form class="card-body" @submit.prevent="onSubmit">
		<h5 class="card-title d-flex justify-content-between">
			{{ isNew ? 'Create' : 'Update' }} Menu Item
		</h5>
		<hr>
		<form-input
			v-model="item.title"
			name="title"
			label="Title"
			placeholder="Pizza"
		/>
		<form-textarea
			v-model="item.description"
			name="description"
			label="Description"
			placeholder="Organic milk tossed over seasoned tomato purée on baked whole wheat."
		/>
		<form-select
			v-model="item.course"
			:options="courseOptions"
			name="course"
			label="Course"
		/>
		<form-select
			v-model="item.child"
			:options="menuOptions"
			name="child"
			label="Menu"
		/>
		<form-switch v-model="item.vegan" name="vegan" label="Vegan" />
		<form-switch v-model="item.vegetarian" name="vegetarian" label="Vegetarian" />
		<form-switch v-model="item.gluten_free" name="gluten_free" label="Gluten Free" />
		<button class="btn btn-primary w-100 mt-3" type="submit">
			Submit
		</button>
	</form>
</template>
