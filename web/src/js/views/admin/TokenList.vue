<script setup>
import { inject, ref } from 'vue';

import { useForm } from 'composables/form';
import { useLoader } from 'composables/loader';

import CardBody from 'components/CardBody.vue';
import CardHeader from 'components/CardHeader.vue';
import RelativeDate from 'components/RelativeDate.vue';
import TableComponent from 'components/TableComponent.vue';

/** @type {Ref<Token[]>} */
const tokens = ref([]);

/** @type {AddToast} */
const addToast = inject('addToast');

// Fetch the list of tokens
useLoader('admin/token', tokens);

const { onSubmit: deleteToken } = useForm({
	method: 'DELETE',
	path: token => `admin/token/${token._id}`,
	onSuccess(_data, _response, token) {
		addToast({
			title: 'Auth Token Removed',
			body: `Auth token "${token.name}" successfully removed.`
		});
		// Refetch the tokens for the table
		useLoader('admin/token', tokens);
	}
});

const tableOpts = {
	caption: 'Auth Token',
	columns: [
		{ id: 'name', text: 'Name' },
		{ id: 'created', text: 'Created' },
		{ id: 'description', text: 'Description' }
	],
	actions(item) {
		if (!item._id) {
			return [];
		}
		return [
			{ text: 'Delete', onClick: () => deleteToken(item), class: 'text-danger' }
		];
	}
};
</script>

<template>
	<card-body>
		<card-header title="Auth Tokens" :back="{ name: 'Admin Overview' }" :action="{ text: 'New Token', to: { name: 'Admin Create Auth Token' } }" />
		<div class="card-text">
			<table-component v-slot="{ item }" :items="tokens" v-bind="tableOpts">
				<td v-text="item.name" />
				<td>
					<relative-date :date="item.created" />
				</td>
				<td v-text="item.description || '---'" />
			</table-component>
		</div>
	</card-body>
</template>
