<script setup>
import { inject, ref } from 'vue';
import { VueShowdown } from 'vue-showdown';

import { classExtensions } from 'lib/showdown';
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
			title: 'Details content Updated',
			body: 'Details page content successfully saved.'
		});
	}
});
</script>

<template>
	<card-header title="Edit Details Page" :back="{ name: 'Admin Overview' }" :on-submit />
	<form class="card-text" @submit.prevent.stop="onSubmit">
		<h5 v-text="'Content'" />
		<textarea
			v-model="content"
			class="form-control w-100 mb-2 font-monospace"
			rows="5"
			:placeholder="placeholder"
		/>

		<h5 v-text="'Preview'" />
		<div class="card shadow">
			<div class="card-body pt-0">
				<card-header title="Details" class="z-0" no-title />
				<div class="card-text">
					<vue-showdown :markdown="content || placeholder" flavor="github" :extensions="classExtensions" />
				</div>
			</div>
		</div>
	</form>
</template>
