<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
	<div class="card-body">
		<h4 class="card-title mb-3">
			Admin Management
		</h4>
		<div class="card-text">
			<button class="btn btn-primary w-100 mb-2">
				View Stats
			</button>
			<router-link class="btn btn-primary w-100 mb-2" :to="{ name: 'Admin List Invitations' }">
				Manage Invitations
			</router-link>
			<router-link class="btn btn-primary w-100 mb-2" :to="{ name: 'Admin List Menu Items' }">
				Manage Menu
			</router-link>
		</div>
	</div>
</template>
