<script setup>
import { inject, ref } from 'vue';
import { VueShowdown } from 'vue-showdown';

import API from 'lib/api';

const source = SOURCE;

/** @type {AddToast} */
const addToast = inject('addToast');
/** @type {Ref<Boolean>} */
const loading = inject('loading');
/** @type {Ref<String>} */
const content = ref('');

const placeholder = 'Add About page content here.';

loading.value = true;
API('about').then(({ result }) => {
	content.value = result.data;
	loading.value = false;
}).catch(() => loading.value = false);


async function onSubmit() {
	loading.value = true;
	await API('about', {
		method: 'PUT',
		body: { content }
	});
	addToast({
		title: 'About content Updated',
		body: 'About page content successfully saved.'
	});
	loading.value = false;
}
</script>

<template>
	<div class="card-body">
		<h4 class="card-title mb-3">
			Edit About Page
		</h4>
		<div class="card-text">
			<textarea v-model="content" class="form-control w-100 mb-2" :placeholder="placeholder" />

			<h5 v-text="'Preview'" />
			<div class="card shadow">
				<div class="card-body">
					<h4 class="card-title">
						About
					</h4>
					<hr>
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
