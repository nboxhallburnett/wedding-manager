<script setup>
import { ref } from 'vue';
import Router from 'router';

import { useLoader } from 'composables/loader';

import CardBody from 'components/CardBody.vue';
import FormItem from 'components/form/FormItem.vue';
import FormText from 'components/form/FormText.vue';

import { formatEventDate } from 'lib/formatter.js';

/** @type {Ref<CalendarEvent>} */
const item = ref({});

useLoader(`calendar/${Router.currentRoute.value.params.calendarEventId}`, item);

function geoLink(item) {
	return `geo:${item.location.geo.lat},${item.location.geo.lon};u=${item.location.radius}?q=${item.location.geo.lat},${item.location.geo.lon}(${encodeURIComponent(`${item.location.title}, ${item.location.address}`)})`;
}
</script>

<template>
	<card-body title="Calendar Event" :back="{ name: 'Admin List Calendar Events' }" :action="{ text: 'Edit Calendar Event', to: { name: 'Admin Edit Calendar Event', params: $route.params } }">
		<div class="card-text">
			<form-text v-model="item.summary" name="summary" label="Summary" />
			<form-text v-model="item.description" name="description" label="Description" />
			<form-item v-if="item.organizer?.email" name="organizer" label="Organizer">
				<a class="form-control-plaintext link-primary" :href="`mailto:${item.organizer.name} <${item.organizer.email}>`" v-text="item.organizer.name" />
			</form-item>
			<form-text name="date" label="Date" :value="formatEventDate(item)" />
			<form-text
				v-if="item.timezone"
				v-model="item.timezone"
				name="timezone"
				label="Timezone"
			/>
			<form-item v-if="item.location?.title" name="location" label="Location">
				<a
					v-if="item.location?.geo?.lat && item.location?.geo?.lon"
					class="form-control-plaintext link-primary"
					:href="geoLink(item)"
					v-text="item.location.title + ', ' + item.location.address"
				/>
				<span v-else class="form-control-plaintext" v-text="item.location.title + ', ' + item.location.address" />
			</form-item>
		</div>
	</card-body>
</template>
