<script setup>
import { RouterLink } from 'vue-router';
import { inject } from 'vue';

import CardHeader from 'components/CardHeader.vue';

/** @type {Ref<Invitation>} */
const invitation = inject('invitation');
</script>

<template>
	<template v-if="invitation?.id">
		<div class="card-body">
			<card-header title="Uh Oh!" />
			<div class="card-text">
				<p>
					You seem to be lost.
				</p>
				<RouterLink class="btn btn-primary w-100" :to="{ name: 'Home' }">
					Home
				</RouterLink>
			</div>
		</div>
	</template>
	<div v-else class="card-text">
		<h4 class="pb-1 text-stroke">
			Uh oh!
		</h4>
		<p class="pb-1 text-stroke">
			You seem to be lost.
		</p>
		<RouterLink class="btn btn-primary w-100" :to="{ name: 'Login' }">
			Home
		</RouterLink>
	</div>
</template>
