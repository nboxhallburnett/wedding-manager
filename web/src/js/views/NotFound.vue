<script setup>
import { RouterLink } from 'vue-router';
import { inject } from 'vue';

/** @type {Ref<Invitation>} */
const invitation = inject('invitation');
</script>

<template>
	<div class="card-body">
		<h4 class="card-title">
			Ruh roh!
		</h4>
		<p class="card-text">
			You seem to be lost.
		</p>
		<RouterLink class="btn btn-primary w-100" :to="invitation?.id ? { name: 'Home' } : { name: 'Login' }">
			Home
		</RouterLink>
	</div>
</template>
