<script setup>
import { inject, ref } from 'vue';
import Router from 'router';

import FormInput from 'components/form/FormInput.vue';
import API from 'lib/api';

/** @type {AddToast} */
const addToast = inject('addToast');
/** @type {Ref<Boolean>} */
const loading = inject('loading');
const guests = ref([ { name: '', status: 0 } ]);

function addGuest() {
	guests.value.push({
		name: '',
		status: 0
	});
}

function removeItem(idx) {
  	guests.value.splice(idx, 1);
}

async function onSubmit(another) {
	loading.value = true;
	await API('invitation', {
		method: 'POST',
		body: { guests }
	});
	const guestMsg = guests.value[0].name
		? `${guests.value[0].name}${guests.value.length > 1 ? ` & ${guests.value.length - 1} other guest${guests.value.length > 2 ? 's' : ''}` : ''}`
		: `${guests.value.length} guest${guests.value.length > 1 ? 's' : ''}`;
	addToast({
		title: 'Invitation Created',
		body: `Invitation for ${guestMsg} successfully created.`
	});
	loading.value = false;
	if (another === true) {
		guests.value = [ { name: '', status: 0 } ];
	} else {
		Router.push({ name: 'Admin List Invitations' });
	}
}
</script>

<template>
	<form class="card-body" @submit.prevent="onSubmit">
		<h4 class="card-title d-flex justify-content-between">
			New Invitation
		</h4>
		<div v-for="(guest, idx) in guests" :key="idx" class="mb-3">
			<hr>
			<form-input v-model="guest.name" label="Name" :name="`guest-${idx}-name`">
				<template v-if="idx" #after>
					<button type="button" class="btn btn-danger" @click="removeItem(idx)">
						Remove
					</button>
				</template>
			</form-input>
		</div>
		<hr>
		<button class="btn btn-primary mb-3" type="button" @click="addGuest">
			Add +1
		</button>
		<div class="btn-group w-100">
			<button class="btn btn-primary w-100" type="submit">
				Submit
			</button>
			<button
				id="save-add-more"
				type="button"
				class="btn btn-primary dropdown-toggle dropdown-toggle-split"
				data-bs-toggle="dropdown"
				aria-expanded="false"
				data-bs-reference="parent"
			>
				<span class="d-none">Dropdown</span>
			</button>
			<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="save-add-more">
				<li>
					<button class="dropdown-item" @click.prevent="onSubmit(true)">
						Submit and invite another
					</button>
				</li>
			</ul>
		</div>
	</form>
</template>
