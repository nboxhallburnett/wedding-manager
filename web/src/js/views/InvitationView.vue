<script setup>
import { inject, ref } from 'vue';
import Router from 'router';

import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';
import FormText from 'components/form/FormText.vue';

// Define var to track whether the component is used for the admin edit vs the user edit
const adminView = Router.currentRoute.value.name === 'Admin View Invitation';
const statusOptions = [ 'Pending', 'Attending', 'Tentative', 'Not Attending' ];

/** @type {Ref<Invitation>} */
const session = inject('invitation');
/** @type {Ref<Invitation>} */
const invitation = ref({});

// If this is the admin view, fetch the invitation from the API, otherwise we can use the session
useLoader([
	adminView ? `invitation/${Router.currentRoute.value.params.invitationId}` : { result: { data: session.value } }
], invitation);
</script>

<template>
	<card-header title="Invitation">
		<router-link v-if="adminView" class="btn btn-link btn-sm me-2" :to="{ name: 'Admin List Invitations' }">
			Back
		</router-link>
		<router-link
			class="btn btn-primary btn-sm"
			:to="adminView
				? { name: 'Admin Edit Invitation' }
				: { name: 'Edit Invitation' }"
		>
			{{ adminView ? 'Edit Invitation' : 'Manage RSVP' }}
		</router-link>
	</card-header>
	<template v-if="invitation?.guests?.length">
		<div class="card-text">
			<div v-for="(guest, idx) in invitation.guests" :key="idx" class="mb-3">
				<template v-if="guest.name">
					<hr v-if="idx">
					<form-text v-model="guest.name" label="Name" :name="`guest-${idx}-name`" />
					<form-text
						:value="statusOptions[guest.status_ceremony]"
						label="Ceremony Attendance"
						:options="statusOptions"
						:name="`guest-${idx}-ceremony`"
					/>
					<form-text
						:value="statusOptions[guest.status_reception]"
						label="Reception Attendance"
						:options="statusOptions"
						:name="`guest-${idx}-reception`"
					/>
				</template>
			</div>
		</div>
		<hr>
	</template>
	<template v-if="invitation?.children?.length">
		<h5 class="mb-3" v-text="'Children'" />
		<div class="card-text">
			<div v-for="(child, idx) in invitation.children" :key="idx" class="mb-3">
				<template v-if="child.name">
					<hr v-if="idx">
					<form-text v-model="child.name" label="Name" :name="`child-${idx}-name`" />
					<form-text v-model="child.age" label="Age" :name="`child-${idx}-age`" />
				</template>
			</div>
		</div>
		<hr>
	</template>
	<form-text
		v-if="invitation?.message"
		v-model="invitation.message"
		label="Message"
		name="message"
	/>
	<form-text
		v-if="invitation?.songs?.filter(Boolean).length"
		v-model="invitation.songs"
		label="Song Suggestions"
		name="songs"
	/>
</template>
