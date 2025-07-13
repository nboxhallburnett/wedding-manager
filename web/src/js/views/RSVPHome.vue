<script setup>
import { inject } from 'vue';

// import API from 'lib/api';

const rsvp = inject('rsvp');
// const loading = inject('loading');
</script>

<template>
	<div class="card-body">
		<h5 class="card-title">
			Manage your RSVP
		</h5>
		<p class="card-text">
			{{ rsvp || '' }}
		</p>
	</div>
</template>
