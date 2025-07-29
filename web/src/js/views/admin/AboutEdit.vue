<script setup>
import { inject, ref } from 'vue';
import { VueShowdown } from 'vue-showdown';

import { useForm } from 'composables/form';
import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';

/** @type {AddToast} */
const addToast = inject('addToast');
/** @type {Ref<String>} */
const content = ref('');

const placeholder = 'Add About page content here.';

// Fetch the about content from the API
useLoader('about', content);

const { onSubmit } = useForm({
	path: 'about',
	method: 'PUT',
	body: { content },
	onSuccess() {
		addToast({
			title: 'About content Updated',
			body: 'About page content successfully saved.'
		});
	}
});
</script>

<template>
	<card-header title="Edit About Page">
		<button class="btn btn-primary btn-sm" type="submit" @click="onSubmit">
			Submit
		</button>
	</card-header>
	<div class="card-text">
		<h5 v-text="'Content'" />
		<textarea v-model="content" class="form-control w-100 mb-2" :placeholder="placeholder" />

		<h5 v-text="'Preview'" />
		<div class="card shadow">
			<div class="card-body pt-0">
				<card-header title="About" class="z-0" />
				<div class="card-text">
					<vue-showdown :markdown="content || placeholder" flavor="github" />
				</div>
			</div>
		</div>
	</div>
</template>
