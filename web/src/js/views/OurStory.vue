<script setup>
import { ref } from 'vue';

import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';

/** @type {Ref<StoryItem[]>} */
const storyItems = ref([]);
const StoryLoading = ref(true);

// Fetch the story content from the API
useLoader('story', storyItems, StoryLoading, true);
</script>

<template>
	<div class="card-body">
		<card-header title="Our Story" />
		<div class="timeline" :class="{ 'placeholder-wave': StoryLoading }">
			<div
				v-for="(item, idx) in storyItems"
				:key="item.id"
				class="timeline-item"
				:class="{ left: idx % 2 === 0, right: idx % 2 === 1 }"
			>
				<div class="date" v-text="item.date" />
				<div class="content">
					<h5 v-text="item.title" />
					<p class="mb-0" v-text="item.description" />
				</div>
			</div>

			<template v-if="StoryLoading">
				<div class="timeline-item left">
					<div class="date">
						<div class="placeholder w-25 rounded-1" />
					</div>
					<div class="content">
						<h5>
							<div class="placeholder w-75 rounded-1" />
							<div class="visually-hidden">
								Loading Placeholder
							</div>
						</h5>
						<span class="placeholder bg-body-secondary w-100 rounded-1" />
						<span class="placeholder bg-body-secondary w-100 rounded-1" />
						<span class="placeholder bg-body-secondary w-25 rounded-1" />
					</div>
				</div>
				<div class="timeline-item right">
					<div class="date">
						<div class="placeholder w-25 rounded-1" />
					</div>
					<div class="content">
						<h5>
							<div class="placeholder w-100 rounded-1" />
							<div class="placeholder w-25 rounded-1" />
							<div class="visually-hidden">
								Loading Placeholder
							</div>
						</h5>
						<span class="placeholder bg-body-secondary w-100 rounded-1" />
						<span class="placeholder bg-body-secondary w-75 rounded-1" />
						<span class="placeholder bg-body-secondary w-50 rounded-1" />
					</div>
				</div>
				<div class="timeline-item left">
					<div class="date">
						<div class="placeholder w-25 rounded-1" />
					</div>
					<div class="content">
						<h5>
							<div class="placeholder w-100 rounded-1" />
							<div class="placeholder w-50 rounded-1" />
							<div class="visually-hidden">
								Loading Placeholder
							</div>
						</h5>
						<span class="placeholder bg-body-secondary w-100 rounded-1" />
						<span class="placeholder bg-body-secondary w-100 rounded-1" />
						<span class="placeholder bg-body-secondary w-50 rounded-1" />
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.timeline::after {
	content: '';
	position: absolute;
	width: 2px;
	background: var(--bs-primary);
	top: 0;
	bottom: 0;
	left: 50%;
	margin-left: -1px;
}

.timeline-item {
	padding: 0 2.2rem;
	position: relative;
	width: 50%;

	.date {
		position: absolute;
		display: inline-block;
		top: calc(50% - 11px);
		text-align: center;
		font-weight: bold;
		color: var(--bs-primary);
		text-transform: uppercase;
		z-index: 1;
	}

	.content {
		padding: 1rem;
		position: relative;
	}

	&.left {
		padding-left: 0;
		left: 0;

		.date {
			text-align: left;
			right: -100%;
			width: calc(100% - 30px);
		}
	}

	&.right {
		padding-right: 0;
		left: 50%;

		&::before {
			left: 8px;
		}

		&::after {
			left: -8px;
		}

		.date {
			text-align: right;
			left: -100%;
			width: calc(100% - 30px);
		}
	}

	&::before {
		content: '';
		position: absolute;
		width: 25px;
		height: 2px;
		top: calc(50% - 1px);
		right: 8px;
		background: var(--bs-primary);
		z-index: 1;
	}

	&::after {
		content: '';
		position: absolute;
		width: 16px;
		height: 16px;
		top: calc(50% - 8px);
		right: -8px;
		background: var(--bs-body-bg);
		border: 2px solid var(--bs-primary);
		border-radius: 16px;
		z-index: 1;
	}
}

@media (max-width: 768px) {
	.timeline::after {
		left: 86px;
	}

	.timeline-item {
		width: 100%;
		padding-left: 105px !important;
		padding-right: 0;

		&.right {
			left: 0;
		}

		&.left::after,
		&.right::after {
			left: 63px;
		}

		&.left::before,
		&.right::before {
			left: 79px;
			border-color: transparent var(--bs-primary) transparent transparent;
		}

		&.left .date,
		&.right .date {
			right: auto;
			left: 0;
			text-align: right;
			max-width: 55px;
		}
	}
}
</style>
