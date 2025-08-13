<script setup>
import { ref } from 'vue';

import CardHeader from 'components/CardHeader.vue';
import DinnerTable from 'components/DinnerTable.vue';

const diningChairs = ref(6);
</script>

<template>
	<card-header title="Dinner Tables" />
	<div class="card-text">
		<button class="btn btn-primary me-3" @click="diningChairs++" v-text="'Add Chair'" />
		<button class="btn btn-primary" @click="diningChairs--" v-text="'Remove Chair'" />
		<dinner-table :count="diningChairs" />
	</div>
</template>
