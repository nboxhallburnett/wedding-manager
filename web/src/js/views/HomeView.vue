<script setup>
import { inject } from 'vue';
import FormText from 'components/form/FormText.vue';

const statusOptions = [ 'Pending', 'Attending', 'Tentative', 'Not Attending' ];

const invitation = inject('invitation');
</script>

<template>
	<div class="card-body">
		<h5 class="card-title d-flex justify-content-between">
			<span>
				Invitation
			</span>
			<router-link class="btn btn-primary btn-sm" :to="{ name: 'Edit Invitation' }">
				Update RSVP
			</router-link>
		</h5>
		<div class="card-text">
			<div v-for="(guest, idx) in (invitation.guests || [])" :key="idx" class="mb-3">
				<hr>
				<form-text v-model="guest.name" label="Name" :name="`guest-${idx}-name`" />
				<form-text
					:value="statusOptions[guest.status]"
					label="Status"
					:options="statusOptions"
					:name="`guest-${idx}-status`"
				/>
			</div>
		</div>
	</div>
</template>
