<script setup>
import { ref } from 'vue';
import { VueShowdown } from 'vue-showdown';

import { dateExtension } from 'lib/showdown';
import { useLoader } from 'composables/loader';

import CardBody from 'components/CardBody.vue';
import CardHeader from 'components/CardHeader.vue';
import CustomHR from 'components/CustomHR.vue';

/** @type {Ref<Calendar[]>} */
const questions = ref([]);
const QAndALoading = ref(true);

// Fetch the Q&A content from the API
useLoader('question', questions, QAndALoading, true);
</script>

<template>
	<card-body>
		<card-header>
			Q<span class="font-script h2 lh-0 px-1">&</span>A
		</card-header>
		<div v-for="(item, idx) in questions" :key="idx" :class="{ 'pt-2': !idx }">
			<hr v-if="idx && idx % 2 === 0" class="fancy-hr">
			<custom-h-r v-else-if="idx" />
			<h5 v-text="item.title" />
			<vue-showdown
				v-if="item.markdown"
				class="text-body-secondary"
				:extensions="[ dateExtension ]"
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
			<custom-h-r />
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
	</card-body>
</template>
