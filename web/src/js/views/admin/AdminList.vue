<script setup>
import { computed, inject, ref } from 'vue';

import { useForm } from 'composables/form';
import { useLoader } from 'composables/loader';

import CardBody from 'components/CardBody.vue';
import TableComponent from 'components/TableComponent.vue';

/** @type {Ref<Invitation[]>} */
const admins = ref([]);

/** @type {AddToast} */
const addToast = inject('addToast');
/** @type {Ref<Invitation>} */
const invitation = inject('invitation');

useLoader('admin', admins);

const { onSubmit: deleteAdmin } = useForm({
	method: 'DELETE',
	path: invitation => `invitation/${invitation.id}`,
	onSuccess(_data, _response, invitation) {
		addToast({
			title: 'Admin Removed',
			body: `Administrator "${invitation.id}" successfully removed.`
		});
		// Refetch the admins for the table
		useLoader('admin', admins);
	}
});

const searchSuggestions = computed(() => admins.value.map(a => a.id).sort());

const tableOpts = {
	caption: 'Administrator',
	columns: [
		{ id: 'id', text: 'Admin ID' },
		{ id: 'email', text: 'OAuth' },
		{ id: 'login_count', text: 'Login Count' }
	],
	search(item, term) {
		// Match on the invitation ID
		return item.id.includes(term);
	},
	suggestions: searchSuggestions,
	actions(item) {
		if (!item.id || item.id === invitation.value.id || (!item.email && !admins.value.some(admin => !admin.email && admin.id !== item.id))) {
			return [];
		}
		return [
			{ text: 'Delete', onClick: () => deleteAdmin(item), class: 'text-danger' }
		];
	}
};
</script>

<template>
	<card-body title="Administrators" :back="{ name: 'Admin Overview' }" :action="{ text: 'New Admin', to: { name: 'Admin Create Administrator' } }">
		<div class="card-text">
			<table-component v-slot="{ item }" :items="admins" v-bind="tableOpts">
				<th scope="row" class="font-monospace" v-text="item.id" />
				<td v-text="item.email ? 'Yes' : 'No'" />
				<td class="text-end" v-text="item.login_count || 0" />
			</table-component>
		</div>
	</card-body>
</template>
