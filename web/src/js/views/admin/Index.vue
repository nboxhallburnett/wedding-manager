<script setup>
import { RouterLink, RouterView } from 'vue-router';

import CardHeader from 'components/CardHeader.vue';

const links = [
	{ text: 'Stats', to: { name: 'Admin Stats' } },
	{ text: 'Invitations', to: { name: 'Admin List Invitations' } },
	{ text: 'Menu', to: { name: 'Admin List Menu Items' } },
	{ text: 'Seating Plan', to: { name: 'Admin View Seating Plan' } },
	{ text: 'Details', to: { name: 'Admin Edit About Content' } },
	{ text: 'Q&A', to: { name: 'Admin Q&A Content' } },
	{ text: 'Our Story', to: { name: 'Admin Our Story Content' } },
	{ text: 'Gallery', to: { name: 'Admin Gallery Content' } },
	{ text: 'Calendar', to: { name: 'Admin List Calendar Events' } },
	{ text: 'Auth Tokens', to: { name: 'Admin List Auth Tokens' } },
	{ text: 'Feedback', to: { name: 'Admin List Feedback Items' } }
];
</script>

<template>
	<div v-if="$route.name === 'Admin Overview'" class="card-body">
		<card-header title="Admin Management" />
		<div class="card-text row g-3">
			<div v-for="(link, idx) in links" :key="idx" class="col-12 col-sm-6">
				<router-link class="btn btn-primary w-100" :to="link.to">
					{{ link.text }}
				</router-link>
			</div>
		</div>
	</div>
	<router-view v-else v-slot="{ Component }">
		<transition name="fade">
			<component :is="Component" />
		</transition>
	</router-view>
</template>
