<script setup>
import { inject, ref } from 'vue';

import CardHeader from 'components/CardHeader.vue';
import FormText from 'components/form/FormText.vue';

const statusOptions = [ 'Pending', 'Attending', 'Tentative', 'Not Attending' ];

/** @type {Ref<Invitation>} */
const invitation = inject('invitation');
/** @type {Ref<Number>} */
const pendingPlusOnes = ref(0);
for (const guest of invitation.value?.guests || []) {
	if (!guest.name) {
		pendingPlusOnes.value++;
	}
}

const calendarLink = `webcal://${document.location.host}/api/calendar.ics`;
</script>

<template>
	<div class="card-body">
		<card-header title="Invitation" :action="{ text: 'Update RSVP', to: { name: 'Edit Invitation' } }" />
		<div class="card-text">
			<div v-for="(guest, idx) in (invitation.guests || [])" :key="idx" class="mb-3">
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
		<form-text
			v-if="pendingPlusOnes"
			name="plus-ones"
			label="Additional Guests"
			hint="Number of additional guests you are able to bring. Be sure to add their info on the Update RSVP page before the day."
			:value="pendingPlusOnes"
		/>
		<form-text
			v-if="invitation.message"
			v-model="invitation.message"
			label="Message"
			name="message"
		/>
		<form-text
			v-if="invitation.songs?.filter(Boolean).length"
			v-model="invitation.songs"
			label="Song Suggestions"
			name="songs"
		/>

		<a class="btn btn-primary" href="/api/calendar.ics">
			Add to calendar
		</a>
		<a class="btn btn-primary ms-2" :href="calendarLink">
			Subscribe to calendar
		</a>
	</div>
</template>
