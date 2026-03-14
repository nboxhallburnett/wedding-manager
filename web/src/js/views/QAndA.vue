<script setup>
import { nextTick, ref, useTemplateRef, watch } from 'vue';
import { VueShowdown } from 'vue-showdown';
import Router from 'router';

import { dateExtension } from 'lib/showdown';
import { dateFormatter } from 'lib/formatter';
import { useLoader } from 'composables/loader';

import CardBody from 'components/CardBody.vue';
import CardHeader from 'components/CardHeader.vue';
import CustomHR from 'components/CustomHR.vue';

/** @type {Ref<{ updated: Date, items: Question[] }>} */
const data = ref({ items: [] });
const QAndALoading = ref(true);
const $markdownContent = useTemplateRef('markdown-content');

// Fetch the Q&A content from the API
useLoader('question', data, QAndALoading, true);

watch(data, () => {
	// Allow vue to propagate our changes onto the DOM
	nextTick(() => {
		// Check generated links to ensure we're handling internal navigation efficiently
		const $anchors = $markdownContent.value.getElementsByTagName('a');
		for (let i = 0; i < $anchors.length; i++) {
			const $anchor = $anchors[i];
			// If it's an external link, make it open in a new tab
			if (!$anchor.href.startsWith('/') && !$anchor.href.startsWith(window.location.origin)) {
				$anchor.setAttribute('target', '_blank');
				return;
			}
			// Otherwise, override its click handler to go through vue-router
			$anchor.addEventListener('click', evt => {
				// If either ctrl or meta was held, let the browser handle it natively
				if (evt.ctrlKey || evt.metaKey) {
					return;
				}
				// Otherwise, prevent the default handling
				evt.preventDefault();
				evt.stopPropagation();
				// And perform the navigation using the router
				Router.push($anchor.href.replace(window.location.origin, ''));
			});
		}
	});
});
</script>

<template>
	<card-body>
		<card-header title="Q&A">
			<div v-if="data.updated" class="align-items-center d-flex fs-6 fst-italic fw-normal h-100 text-muted text-end ps-3">
				Last updated: {{ dateFormatter.format(new Date(data.updated)) }}
			</div>
		</card-header>
		<div v-if="!QAndALoading" ref="markdown-content">
			<div v-for="(item, idx) in data.items" :key="idx" :class="{ 'pt-2': !idx }">
				<hr v-if="idx && idx % 2 === 0" class="fancy-hr">
				<custom-h-r v-else-if="idx" />
				<h5 v-text="item.title" />
				<vue-showdown
					v-if="item.markdown"
					class="text-body-secondary"
					flavor="github"
					:extensions="[ dateExtension ]"
					:markdown="item.answer || 'Preview'"
				/>
				<div v-else class="text-body-secondary" v-text="item.answer" />
			</div>
		</div>
		<div v-else class="placeholder-wave">
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
