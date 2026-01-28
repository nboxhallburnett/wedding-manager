<script setup>
import { RouterLink } from 'vue-router';
import { inject } from 'vue';

import CardBody from 'components/CardBody.vue';

/** @type {Ref<Invitation>} */
const invitation = inject('invitation');
</script>

<template>
	<template v-if="invitation?.id">
		<card-body title="Uh Oh!">
			<div class="card-text">
				<p>
					You seem to be lost.
				</p>
				<RouterLink class="btn btn-primary w-100" :to="{ name: 'Home' }">
					Home
				</RouterLink>
			</div>
		</card-body>
	</template>
	<div v-else class="card-text">
		<h4 class="pb-1 text-stroke">
			Uh oh!
		</h4>
		<p class="pb-1 text-stroke">
			You seem to be lost.
		</p>
		<RouterLink class="btn btn-primary w-100" :to="{ name: 'Login', query: { redirect: $router.currentRoute.value.href } }">
			Home
		</RouterLink>
	</div>
</template>
