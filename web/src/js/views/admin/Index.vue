<script setup>
import { RouterLink, RouterView } from 'vue-router';

import CardHeader from 'components/CardHeader.vue';

const links = [
	{ text: 'Stats', to: { name: 'Admin Stats' } },
	{ text: 'Invitations', to: { name: 'Admin List Invitations' } },
	{ text: 'Menu', to: { name: 'Admin List Menu Items' } },
	{ text: 'Calendar', to: { name: 'Admin List Calendar Events' } },
	{ text: 'About', to: { name: 'Admin Edit About Content' } }
];
</script>

<template>
	<template v-if="$route.name === 'Admin Overview'">
		<card-header title="Admin Management" />
		<div class="card-text row g-3">
			<div v-for="(link, idx) in links" :key="idx" class="col-12 col-sm-6">
				<router-link class="btn btn-primary w-100" :to="link.to">
					{{ link.text }}
				</router-link>
			</div>
		</div>
	</template>
	<router-view v-else />
</template>
