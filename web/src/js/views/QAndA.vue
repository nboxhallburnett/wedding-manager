<script setup>
import { ref } from 'vue';
import { VueShowdown } from 'vue-showdown';

import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';

/** @type {Ref<Calendar[]>} */
const questions = ref([]);

// Fetch the Q&A content from the API
useLoader('question', questions);
</script>

<template>
	<card-header>
		Q<span class="font-script h2 lh-0 px-1">&</span>A
	</card-header>
	<div v-for="(item, idx) in questions" :key="idx" :class="{ 'pt-2': !idx }">
		<hr v-if="idx" class="fancy-hr">
		<h5 v-text="item.title" />
		<vue-showdown
			v-if="item.markdown"
			class="text-body-secondary"
			:markdown="item.answer || 'Preview'"
			flavor="github"
		/>
		<div v-else class="text-body-secondary" v-text="item.answer" />
	</div>
</template>
