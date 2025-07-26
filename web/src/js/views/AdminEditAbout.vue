<script setup>
import { inject, ref } from 'vue';
import { VueShowdown } from 'vue-showdown';

import { useForm } from 'composables/form';
import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';

const source = SOURCE;

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
	<div class="card-body">
		<card-header title="Edit About Page" />
		<div class="card-text">
			<h5 v-text="'Content'" />
			<textarea v-model="content" class="form-control w-100 mb-2" :placeholder="placeholder" />

			<h5 v-text="'Preview'" />
			<div class="card shadow">
				<div class="card-body">
					<card-header title="About" />
					<div class="card-text">
						<vue-showdown :markdown="content || placeholder" flavor="github" />
					</div>
					<hr>
					<div class="card-text">
						Source:<br>
						<a :href="source" v-text="source" />
					</div>
				</div>
			</div>

			<button class="btn btn-primary w-100 mt-3" @click="onSubmit">
				Save
			</button>
		</div>
	</div>
</template>
