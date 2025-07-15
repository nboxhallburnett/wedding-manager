<script setup>
import { inject } from 'vue';

// import API from 'lib/api';

const rsvp = inject('rsvp');
// const loading = inject('loading');
</script>

<template>
	<div class="card-body">
		<h5 class="card-title d-flex justify-content-between">
			<span>
				Invitation
			</span>
			<router-link class="btn btn-primary btn-sm" :to="{ name: 'Edit RSVP' }">
				Update RSVP
			</router-link>
		</h5>
		<p class="card-text">
			{{ JSON.stringify(rsvp, null, 2) }}
		</p>
	</div>
</template>
