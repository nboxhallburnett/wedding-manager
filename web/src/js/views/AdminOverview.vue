<script setup>
import { RouterLink, RouterView } from 'vue-router';

import CardHeader from 'components/CardHeader.vue';
</script>

<template>
	<div v-if="$route.name === 'Admin Overview'" class="card-body">
		<card-header title="Admin Management" />
		<div class="card-text row g-3">
			<div class="col-12 col-sm-6">
				<router-link class="btn btn-primary w-100" :to="{ name: 'Admin Stats' }">
					Stats
				</router-link>
			</div>
			<div class="col-12 col-sm-6">
				<router-link class="btn btn-primary w-100" :to="{ name: 'Admin List Invitations' }">
					Invitations
				</router-link>
			</div>
			<div class="col-12 col-sm-6">
				<router-link class="btn btn-primary w-100" :to="{ name: 'Admin List Menu Items' }">
					Menu
				</router-link>
			</div>
			<div class="col-12 col-sm-6">
				<router-link class="btn btn-primary w-100" :to="{ name: 'Admin List Calendar Events' }">
					Calendar
				</router-link>
			</div>
			<div class="col-12 col-sm-6">
				<router-link class="btn btn-primary w-100" :to="{ name: 'Admin Edit About Content' }">
					About
				</router-link>
			</div>
		</div>
	</div>
	<router-view v-else />
</template>
