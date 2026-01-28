<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

import { useLoader } from 'composables/loader';
import { statusMessages } from 'lib/formatter';

import CardBody from 'components/CardBody.vue';
import InfoPopover from 'components/InfoPopover.vue';

const stats = ref({
	status_ceremony: {},
	status_reception: {},
	unused_plus_one: 0,
	total_children: 0,
	total_logins: 0,
	total_song_requests: 0,
	total_messages: 0,
	telemetry: {}
});

const statusMap = [
	{ title: 'Ceremony', key: 'status_ceremony' },
	{ title: 'Reception', key: 'status_reception' }
];
const countMap = [
	{ title: 'Children', key: 'total_children', to: { name: 'Admin List Invitations' } },
	{ title: 'Logins', key: 'total_logins', to: { name: 'Admin List Invitations' } },
	{ title: 'Songs', key: 'total_song_requests', to: { name: 'Admin List Invitation Songs' } },
	{ title: 'Messages', key: 'total_messages', to: { name: 'Admin List Invitation Messages' } },
	{ title: 'Unused +1', key: 'unused_plus_one', to: { name: 'Admin List Invitations' } }
];

// Fetch the list of events
useLoader('admin/stats/invitations?telemetry=1', stats);

function viewportPopover(stats) {
	return `<table>
	<thead />
	<tbody>
		<tr><td class="pe-2">xs:</td><td>${stats.xs || 0}</td></tr>
		<tr><td class="pe-2">sm:</td><td>${stats.sm || 0}</td></tr>
		<tr><td class="pe-2">md:</td><td>${stats.md || 0}</td></tr>
		<tr><td class="pe-2">lg:</td><td>${stats.lg || 0}</td></tr>
		<tr><td class="pe-2">xl:</td><td>${stats.xl || 0}</td></tr>
		<tr><td class="pe-2">xxl:</td><td>${stats.xxl || 0}</td></tr>
	</tbody>
</table>`;
}
</script>

<template>
	<card-body title="Stats" :back="{ name: 'Admin Overview' }">
		<div class="row g-3">
			<div v-for="({ key, title }) in statusMap" :key class="col-12 col-md-6">
				<router-link class="card shadow text-decoration-none" :to="{ name: 'Admin List Invitations' }">
					<h5 class="card-header" v-text="title" />
					<div class="d-flex flex-wrap gx-3 pt-3">
						<div v-for="(status, idx) in statusMessages" :key="idx" class="card-body col-6">
							<div class="card-text" v-text="status" />
							<div class="text-primary h2" v-text="stats[key][idx] || 0" />
						</div>
					</div>
				</router-link>
			</div>
			<div v-for="({ key, title, to }) in countMap" :key class="col-6 col-sm-3">
				<component :is="to ? RouterLink : 'div'" class="card shadow text-decoration-none" :to="to">
					<h5 class="card-header" v-text="title" />
					<div class="card-body pt-3">
						<div class="text-primary h2" v-text="stats[key] || 0" />
					</div>
				</component>
			</div>
			<div class="col-12">
				<router-link class="card shadow text-decoration-none" :to="{ name: 'Admin List Telemetry' }">
					<h5 class="card-header" v-text="'Telemetry'" />
					<div class="d-flex flex-wrap gx-3 pt-3">
						<div v-for="[ path, stat ] in Object.entries(stats?.telemetry || {}).sort((a, b) => b[1].count - a[1].count)" :key="path" class="card-body flex-grow-0 col-sm-3 col-6">
							<div class="card-text" v-text="path" />
							<div class="text-primary h2">
								<info-popover title="Viewports" :hint="viewportPopover(stat.viewports)" :opts="{ html: true }">
									{{ stat.count }}
								</info-popover>
							</div>
						</div>
					</div>
				</router-link>
			</div>
		</div>
	</card-body>
</template>

<style lang="scss" scoped>
a.card {
	transition: box-shadow 0.15s ease-out;

	&:hover {
		box-shadow: 0 0.5rem 1rem rgb(0, 0, 0, 0.25) !important;
	}
}
</style>
