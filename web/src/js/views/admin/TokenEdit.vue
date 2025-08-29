<script setup>
import { inject, ref } from 'vue';
import Router from 'router';

import { useForm } from 'composables/form';

import CardBody from 'components/CardBody.vue';
import FormInput from 'components/form/FormInput.vue';
import FormTextarea from 'components/form/FormTextarea.vue';

/** @type {AddToast} */
const addToast = inject('addToast');

/** @type {Ref<Token>} */
const item = ref({});

const { onSubmit } = useForm({
	method: 'POST',
	path: 'admin/token',
	body: item,
	validation: true,
	onSuccess(res) {
		// Output the token ID in the confirmation toast. This is the only place the ID value will ever be exposed,
		// so disable autohide for it.
		addToast({
			title: 'Auth Token Created',
			body: `Auth Token "${item.value.name}" successfully created. Auth Token ID: ${res.data.id}`
		}, { autohide: false });
		Router.push({ name: 'Admin List Auth Tokens' });
	}
});
</script>

<template>
	<card-body title="Create Auth Token" :back="{ name: 'Admin List Auth Tokens' }" :on-submit>
		<form class="card-text needs-validation" novalidate @submit.prevent.stop="onSubmit">
			<form-input
				v-model="item.name"
				name="name"
				label="Name"
				placeholder="Brief description of intended use"
				required
			/>
			<form-textarea
				v-model="item.description"
				name="description"
				label="Description"
				placeholder="A more in depth description of the use of the token"
			/>
		</form>
	</card-body>
</template>
