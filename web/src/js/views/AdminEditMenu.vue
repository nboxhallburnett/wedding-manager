<script setup>
import { inject, ref, watch } from 'vue';
import Router from 'router';

import { useForm } from 'composables/form';
import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';
import FormInput from 'components/form/FormInput.vue';
import FormSelect from 'components/form/FormSelect.vue';
import FormTextarea from 'components/form/FormTextarea.vue';
import FormSwitch from 'components/form/FormSwitch.vue';

/** @type {AddToast} */
const addToast = inject('addToast');

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
	useLoader(`menu/${Router.currentRoute.value.params.menuItemId}`, item);
}

const { onSubmit } = useForm({
	method: () => isNew ? 'POST' : 'PUT',
	path: () => isNew ? 'calendar' : `calendar/${item.value.id}`,
	body: item,
	onSuccess() {
		addToast({
			title: `Menu Item ${isNew ? 'Created' : 'Updated'}`,
			body: isNew
				? `Menu Item "${item.value.title}" successfully created.`
				: `Menu Item "${item.value.title}" successfully updated.`
		});
		Router.push({ name: 'Admin List Menu Items' });
	}
});

watch(() => item.value.vegan, value => {
	// If an item is vegan, it is also vegetarian
	if (value) {
		item.value.vegetarian = true;
	}
});
</script>

<template>
	<form class="card-body" @submit.prevent="onSubmit">
		<card-header :title="`${isNew ? 'Create' : 'Update'} Menu Item`" />
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
