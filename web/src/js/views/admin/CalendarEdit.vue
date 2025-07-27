<script setup>
import { inject, ref, nextTick } from 'vue';
import Router from 'router';

import { useForm } from 'composables/form';
import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';
import FormItem from 'components/form/FormItem.vue';
import FormInput from 'components/form/FormInput.vue';
import FormTextarea from 'components/form/FormTextarea.vue';
import FormSwitch from 'components/form/FormSwitch.vue';

/** @type {AddToast} */
const addToast = inject('addToast');

/** @type {Ref<CalendarEvent>} */
const item = ref({
	allDay: false,
	description: '',
	start: '',
	end: '',
	timezone: '',
	summary: '',
	location: {
		title: '',
		address: '',
		radius: undefined,
		geo: {
			lat: undefined,
			lon: undefined
		}
	},
	organizer: {
		name: '',
		email: ''
	}
});

// Define var to track whether the component is being used for a create or update operation
const isNew = Router.currentRoute.value.name.includes('Create');

if (!isNew) {
	useLoader(`calendar/${Router.currentRoute.value.params.calendarEventId}`, ([ { result } ]) => {
		// `date` and `datetime-local` inputs are very specific about their
		// allowed formats, so generate their values from the returned dates
		const start = result.data.start
			? new Date(result.data.start).toISOString().slice(0, result.data.allDay ? 10 : 16)
			: '';
		const end = result.data.end
			? new Date(result.data.end).toISOString().slice(0, result.data.allDay ? 10 : 16)
			: '';

		// And clear the returned values so the console doesn't complain
		delete result.data.start;
		delete result.data.end;

		item.value = result.data;

		// The input type can have issues with the value binding correctly on load,
		// so wait for vue to propagate the DOM change and manually set their values
		// to the ones we generated above
		nextTick(() => {
			item.value.start = start;
			item.value.end = end;
		});
	});
}

const { onSubmit } = useForm({
	method: () => isNew ? 'POST' : 'PUT',
	path: () => isNew ? 'calendar' : `calendar/${item.value.id}`,
	body() {
		// ical files are specific about radius/lat/lon values so ensure we only send valid values for them
		item.value.location.radius = Number(item.value.location.radius) >= 0
			? Number(item.value.location.radius)
			: undefined;
		item.value.location.geo.lat = Number(item.value.location.geo.lat) >= 0
			? Number(item.value.location.geo.lat)
			: undefined;
		item.value.location.geo.lon = Number(item.value.location.geo.lon) >= 0
			? Number(item.value.location.geo.lon)
			: undefined;
		return item;
	},
	onSuccess() {
		addToast({
			title: `Calendar Event ${isNew ? 'Created' : 'Updated'}`,
			body: isNew
				? `Calendar Event "${item.value.summary}" successfully created.`
				: `Calendar Event "${item.value.summary}" successfully updated.`
		});
		Router.push({ name: 'Admin List Calendar Events' });
	}
});
</script>

<template>
	<form @submit.prevent="onSubmit">
		<card-header :title="`${isNew ? 'Create' : 'Update'} Calendar Event`">
			<router-link class="btn btn-outline-dark btn-sm me-2" :to="{ name: isNew ? 'Admin List Calendar Events' : 'Admin View Calendar Event' }">
				Back
			</router-link>
			<button class="btn btn-primary btn-sm" type="submit">
				Submit
			</button>
		</card-header>
		<form-input
			v-model="item.summary"
			name="summary"
			label="Summary"
			placeholder="Wedding Ceremony"
		/>
		<form-textarea
			v-model="item.description"
			name="description"
			label="Description"
			placeholder="You are cordially invited to attend our wedding ceremony."
		/>
		<form-switch v-model="item.allDay" name="allDay" label="All Day" />
		<form-input
			v-model="item.start"
			name="start"
			label="Start"
			:type="item.allDay ? 'date' : 'datetime-local'"
			:max="item.end"
		/>
		<form-input
			v-model="item.end"
			name="end"
			label="End"
			:type="item.allDay ? 'date' : 'datetime-local'"
			:min="item.start"
		/>
		<form-input
			v-model="item.timezone"
			name="timezone"
			label="Timezone"
			placeholder="Europe/London"
		/>
		<form-input
			v-model="item.organizer.name"
			name="organizer"
			label="Organizer"
			placeholder="Name"
		>
			<template #after>
				<span class="input-group-text" v-text="'<'" />
				<input
					id="email"
					v-model="item.organizer.email"
					name="email"
					autocomplete="off"
					class="form-control"
					placeholder="email@example.com"
					type="email"
				>
				<span class="input-group-text" v-text="'>'" />
			</template>
		</form-input>
		<form-item name="location" label="Location" group-class="">
			<div class="input-group mb-2">
				<span class="input-group-text w-25" v-text="'Name'" />
				<input
					id="location"
					v-model="item.location.title"
					name="location"
					class="form-control"
					placeholder="Location Name"
				>
			</div>
			<div class="input-group mb-2">
				<span class="input-group-text w-25" v-text="'Address'" />
				<input
					id="address"
					v-model="item.location.address"
					name="address"
					autocomplete="off"
					class="form-control"
					placeholder="Address"
				>
			</div>
			<div class="input-group mb-2">
				<span class="input-group-text w-25" v-text="'Radius'" />
				<input
					id="radius"
					v-model="item.location.radius"
					name="radius"
					class="form-control"
					placeholder="Radius"
					inputmode="numeric"
					pattern="\d+(.\d*)?"
				>
			</div>
			<div class="input-group">
				<span class="input-group-text" v-text="'Lat'" />
				<input
					id="latitude"
					v-model="item.location.geo.lat"
					name="latitude"
					class="form-control"
					placeholder="Latitude"
					inputmode="numeric"
					pattern="-?\d+(.\d*)?"
				>
				<span class="input-group-text" v-text="'Lon'" />
				<input
					id="longitude"
					v-model="item.location.geo.lon"
					name="longitude"
					class="form-control"
					placeholder="Longitude"
					inputmode="numeric"
					pattern="-?\d+(.\d*)?"
				>
			</div>
		</form-item>
	</form>
</template>
