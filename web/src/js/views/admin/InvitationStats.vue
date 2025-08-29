<script setup>
import { ref } from 'vue';

import { useLoader } from 'composables/loader';
import { statusMessages } from 'lib/formatter';

import CardBody from 'components/CardBody.vue';

const stats = ref({
	status_ceremony: {},
	status_reception: {},
	unused_plus_one: 0,
	total_children: 0,
	total_logins: 0,
	total_song_requests: 0,
	total_messages: 0
});

const statusMap = [
	{ title: 'Ceremony', key: 'status_ceremony' },
	{ title: 'Reception', key: 'status_reception' }
];
const countMap = [
	{ title: 'Children', key: 'total_children' },
	{ title: 'Logins', key: 'total_logins' },
	{ title: 'Songs', key: 'total_song_requests' },
	{ title: 'Messages', key: 'total_messages' },
	{ title: 'Unused +1', key: 'unused_plus_one' }
];

// Fetch the list of events
useLoader('admin/stats/invitations', stats);

</script>

<template>
	<card-body title="Stats" :back="{ name: 'Admin Overview' }">
		<div class="row g-3">
			<div v-for="({ key, title }) in statusMap" :key class="col-12 col-md-6">
				<div class="card shadow">
					<h5 class="card-header" v-text="title" />
					<div class="d-flex flex-wrap gx-3">
						<div v-for="(status, idx) in statusMessages" :key="idx" class="card-body col-6">
							<div class="card-text" v-text="status" />
							<div class="text-primary h2" v-text="stats[key][idx] || 0" />
						</div>
					</div>
				</div>
			</div>
			<div v-for="({ key, title }) in countMap" :key class="col-6 col-md-3">
				<div class="card shadow">
					<h5 class="card-header" v-text="title" />
					<div class="card-body">
						<div class="text-primary h2" v-text="stats[key] || 0" />
					</div>
				</div>
			</div>
		</div>
	</card-body>
</template>
