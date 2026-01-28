<script setup>
import { RouterLink } from 'vue-router';

import CardBody from 'components/CardBody.vue';
</script>

<template>
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
