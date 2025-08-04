<script setup>
import { ref } from 'vue';
import { VueShowdown } from 'vue-showdown';

import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';

// Get the bride and groom's first initial for use as the content in alternating Q&A dividers
const brideInitial = String(CONFIG.bride).toUpperCase().charAt(0);
const groomInitial = String(CONFIG.groom).toUpperCase().charAt(0);
const dividerAlternatingContent = ref(`"${brideInitial}⚭${groomInitial}"`);

/** @type {Ref<Calendar[]>} */
const questions = ref([]);
const QAndALoading = ref(true);

// Fetch the Q&A content from the API
useLoader('question', questions, QAndALoading, true);
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
	<div v-if="QAndALoading" class="placeholder-wave">
		<h5>
			<div class="placeholder w-50 rounded-1" />
			<div class="visually-hidden">
				Loading Placeholder
			</div>
		</h5>
		<span class="placeholder bg-body-secondary w-100 rounded-1" />
		<span class="placeholder bg-body-secondary w-75 rounded-1" />
		<hr class="fancy-hr">
		<h5>
			<div class="placeholder w-75 rounded-1" />
			<div class="placeholder w-25 d-block mt-1 rounded-1" />
			<div class="visually-hidden">
				Loading Placeholder
			</div>
		</h5>
		<span class="placeholder bg-body-secondary w-100 rounded-1" />
		<span class="placeholder bg-body-secondary w-75 rounded-1" />
		<hr class="fancy-hr">
		<h5>
			<div class="placeholder w-75 rounded-1" />
			<div class="visually-hidden">
				Loading Placeholder
			</div>
		</h5>
		<span class="placeholder bg-body-secondary w-100 rounded-1" />
		<span class="placeholder bg-body-secondary w-100 rounded-1" />
		<span class="placeholder bg-body-secondary w-75 rounded-1" />
	</div>
</template>

<style lang="scss" scoped>
div:nth-of-type(2n) > hr.fancy-hr {
	&::after {
		content: v-bind(dividerAlternatingContent);
	}
}
</style>
