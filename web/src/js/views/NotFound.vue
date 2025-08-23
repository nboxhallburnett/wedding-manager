<script setup>
import { RouterLink } from 'vue-router';
import { inject } from 'vue';

import CardHeader from 'components/CardHeader.vue';

/** @type {Ref<Invitation>} */
const invitation = inject('invitation');
</script>

<template>
	<card-header title="Uh Oh!" />
	<div class="card-text">
		<p>
			You seem to be lost.
		</p>
		<RouterLink class="btn btn-primary w-100" :to="invitation?.id ? { name: 'Home' } : { name: 'Login' }">
			Home
		</RouterLink>
	</div>
</template>
