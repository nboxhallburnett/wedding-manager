<script setup>
import { RouterLink } from 'vue-router';
import { inject } from 'vue';

const invitation = inject('invitation');
</script>

<template>
	<div class="card-body">
		<h5 class="card-title">
			Ruh roh!
		</h5>
		<p class="card-text">
			You seem to be lost.
		</p>
		<RouterLink class="btn btn-primary w-100" :to="invitation?.id ? { name: 'Home' } : { name: 'Login' }">
			Home
		</RouterLink>
	</div>
</template>
