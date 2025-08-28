<script setup>
import CardBody from 'components/CardBody.vue';
import InvitationView from './InvitationView.vue';

const calendarLink = `webcal://${document.location.host}/api/calendar.ics`;
</script>

<template>
	<card-body>
		<invitation-view />

		<a class="btn btn-primary" href="/api/calendar.ics">
			Add to calendar
		</a>
		<a class="btn btn-primary ms-2" :href="calendarLink">
			Subscribe to calendar
		</a>
	</card-body>
</template>
