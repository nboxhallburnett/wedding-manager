<script setup>
import { inject, ref } from 'vue';
import Router from 'router';

import { useForm } from 'composables/form';

import CardBody from 'components/CardBody.vue';
import CardHeader from 'components/CardHeader.vue';
import FormInput from 'components/form/FormInput.vue';
import FormSwitch from 'components/form/FormSwitch.vue';

/** @type {AddToast} */
const addToast = inject('addToast');
const admin = ref({ id: '', email: false });

const oauthEnabled = Boolean(CONFIG.oauth.client_id);

const { onSubmit } = useForm({
	path: 'admin',
	method: 'POST',
	validation: true,
	body: admin,
	onSuccess() {
		addToast({
			title: 'Admin Created',
			body: `Administrator "${admin.value.id}" successfully created.`
		});
		Router.push({ name: 'Admin View Administrators' });
	}
});
</script>

<template>
	<card-body>
		<card-header title="New Administrator" :back="{ name: 'Admin View Administrators' }" :on-submit />
		<form class="card-text needs-validation" novalidate @submit.prevent.stop="onSubmit">
			<form-input
				v-model="admin.id"
				:type="admin.email ? 'email' : 'text'"
				name="id"
				label="ID"
				:placeholder="admin.email ? 'administrator@example.com' : 'administrator'"
				required
			/>
			<form-switch
				v-if="oauthEnabled"
				v-model="admin.email"
				name="email"
				label="Email"
				hint="Whether the admin can access externally via OAuth verification. If enabled, the ID should be a valid and verified email address with the configured OAuth provider."
			/>
		</form>
	</card-body>
</template>
