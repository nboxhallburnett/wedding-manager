<script setup>
import { inject, ref } from 'vue';
import Router from 'router';

import CardHeader from 'components/CardHeader.vue';
import FormItem from 'components/form/FormItem.vue';
import FormText from 'components/form/FormText.vue';

import API from 'lib/api';
import { formatDate } from 'lib/formatter';

/** @type {Ref<Boolean>} */
const loading = inject('loading');
/** @type {Ref<CalendarEvent>} */
const item = ref({});

loading.value = true;
API(`calendar/${Router.currentRoute.value.params.calendarEventId}`).then(({ result }) => {
	item.value = result.data;
	loading.value = false;
}).catch(() => loading.value = false);
</script>

<template>
	<div class="card-body">
		<card-header title="Calendar Event" :action="{ text: 'Update Calendar Event', to: { name: 'Admin Edit Calendar Event', params: $route.params } }" />
		<form-text v-model="item.summary" name="summary" label="Summary" />
		<form-text v-model="item.description" name="description" label="Description" />
		<form-item v-if="item.organizer?.email" name="organizer" label="Organizer">
			<a class="form-control-plaintext link-primary" :href="`mailto:${item.organizer.name} <${item.organizer.email}>`" v-text="item.organizer.name" />
		</form-item>
		<form-text name="date" label="Date" :value="formatDate(item)" />
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
				:href="`geo:${item.location.geo.lat},${item.location.geo.lon};u=${item.location.radius}?q=${item.location.geo.lat},${item.location.geo.lon}(${encodeURIComponent(item.location.title + ', ' + item.location.address)})`"
				v-text="item.location.title + ', ' + item.location.address"
			/>
			<span v-else class="form-control-plaintext" v-text="item.location.title + ', ' + item.location.address" />
		</form-item>
	</div>
</template>
