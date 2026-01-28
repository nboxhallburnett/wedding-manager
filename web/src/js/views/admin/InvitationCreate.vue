<script setup>
import { inject, ref } from 'vue';
import Router from 'router';

import { useForm } from 'composables/form';

import CardBody from 'components/CardBody.vue';
import CardHeader from 'components/CardHeader.vue';
import FormInput from 'components/form/FormInput.vue';

/** @type {AddToast} */
const addToast = inject('addToast');
const guests = ref([ { name: '', status: 0 } ]);

const { onSubmit } = useForm({
	path: 'invitation',
	method: 'POST',
	body: { guests },
	onSuccess(_data, _response, another) {
		const guestMsg = guests.value[0].name
			? `${guests.value[0].name}${guests.value.length > 1 ? ` & ${guests.value.length - 1} other guest${guests.value.length > 2 ? 's' : ''}` : ''}`
			: `${guests.value.length} guest${guests.value.length > 1 ? 's' : ''}`;
		addToast({
			title: 'Invitation Created',
			body: `Invitation for "${guestMsg}" successfully created.`
		});
		if (another === true) {
			guests.value = [ { name: '', status: 0 } ];
		} else {
			Router.push({ name: 'Admin List Invitations' });
		}
	}
});

/**
 * Add a new guest to the invitation
 */
function addGuest() {
	guests.value.push({
		name: '',
		status: 0
	});
}
/**
 * Remove a guest from the invitation
 *
 * @param {Number} idx Index of the guest to remove
 */
function removeGuest(idx) {
	guests.value.splice(idx, 1);
}
</script>

<template>
	<card-body>
		<card-header title="New Invitation">
			<router-link class="btn btn-link btn-sm me-2" :to="{ name: 'Admin List Invitations' }">
				Back
			</router-link>
			<div class="btn-group">
				<button class="btn btn-sm btn-primary w-100" type="submit" @click.prevent="onSubmit()">
					Save
				</button>
				<button
					id="save-add-more"
					type="button"
					class="btn btn-primary dropdown-toggle dropdown-toggle-split"
					data-bs-toggle="dropdown"
					aria-expanded="false"
					data-bs-reference="parent"
				>
					<span class="visually-hidden">Dropdown</span>
				</button>
				<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="save-add-more">
					<li>
						<button class="dropdown-item" @click.prevent="onSubmit(true)">
							Save and invite another
						</button>
					</li>
				</ul>
			</div>
		</card-header>
		<form class="card-text" @submit.prevent.stop="onSubmit">
			<div v-for="(guest, idx) in guests" :key="idx" class="mb-3">
				<hr v-if="idx">
				<form-input v-model="guest.name" label="Name" :name="`guest-${idx}-name`">
					<template v-if="idx" #after>
						<button type="button" class="btn btn-danger" @click="removeGuest(idx)">
							Remove
						</button>
					</template>
				</form-input>
			</div>
			<hr>
			<button class="btn btn-primary mb-3" type="button" @click="addGuest">
				Add +1
			</button>
		</form>
	</card-body>
</template>
