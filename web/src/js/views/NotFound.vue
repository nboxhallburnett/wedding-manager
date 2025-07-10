<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
	<div class="card-body">
		<h5 class="card-title">
			Ruh roh!
		</h5>
		<p class="card-text">
			You seem to be lost.
		</p>
		<RouterLink class="btn btn-primary w-100" :to="{ name: 'home' }">
			Home
		</RouterLink>
	</div>
</template>
