<script setup>
import { computed, ref, onMounted, useTemplateRef } from 'vue';
// TODO: Replace this back once (if) html-to-image is updated with this merged:
// https://github.com/bubkoo/html-to-image/pull/547
import { toPng } from '@jpinsonneau/html-to-image';
// import { toBlob, toPng } from 'html-to-image';

import { useLoader } from 'composables/loader';

import CardBody from 'components/CardBody.vue';
import CardHeader from 'components/CardHeader.vue';
import DietIndicator from 'components/DietIndicator.vue';

const reFill = / fill="(#?\w+)"/;
const courseOptions = [ 'Starter', 'Main', 'Dessert' ];

/** @type {Ref<MenuItem[]>} */
const menu = ref([]);
const $card = useTemplateRef('card');
const $childCard = useTemplateRef('childCard');
const borderContent = ref('');

useLoader('menu', menu);

onMounted(async() => {
	// Fetch the themed colours to use for the border content
	const primaryColour = getComputedStyle($card.value).getPropertyValue('--bs-primary');

	// Fetch the border svg content from the server
	const borderSvg = await fetch('/img/invitation/border.svg');
	// Get their text value
	const borderSvgContent = await borderSvg.text();
	borderContent.value = borderSvgContent
		// Replace the border fill colour with the themed primary colour
		.replace(reFill, ` fill="${primaryColour}"`);
});

/**
 * Trigger the download of the menu cards as PNGs
 */
async function downloadImage() {
	const adultMenuDataUrl = await toPng($card.value, {
		cacheBust: true,
		style: { margin: 0 }
	});
	const adultMenuLink = document.createElement('a');
	adultMenuLink.download = 'wedding_menu.png';
	adultMenuLink.href = adultMenuDataUrl;
	adultMenuLink.click();

	setTimeout(async () => {
		const childMenuDataUrl = await toPng($childCard.value, {
			cacheBust: true,
			style: { margin: 0 }
		});
		const childMenuLink = document.createElement('a');
		childMenuLink.download = 'wedding_childrens_menu.png';
		childMenuLink.href = childMenuDataUrl;
		childMenuLink.click();
	}, 200);
}

const adultMenu = computed(() => {
	return menu.value?.reduce((items, item) => {
		if (item.child) {
			return items;
		}
		items[item.course].push(item);
		return items;
	}, [ [], [], [] ]);
});

const childMenu = computed(() => {
	return menu.value.reduce((items, item) => {
		if (!item.child) {
			return items;
		}
		items[item.course].push(item);
		return items;
	}, [ [], [], [] ]);
});
</script>

<template>
	<card-body>
		<card-header title="Menu">
			<router-link class="btn btn-link btn-sm me-2" :to="{ name: 'Admin List Menu Items' }">
				Back
			</router-link>
			<button class="btn btn-primary btn-sm" @click="downloadImage">
				Download
			</button>
		</card-header>
		<div
			ref="card"
			class="card menu-card shadow"
			data-bs-theme="light"
		>
			<div class="card-body">
				<div class="card-content">
					<div class="card-text h-100">
						<div id="menu-header" class="text-center">
							<div id="title" class="font-script text-body my-3 pb-3" v-text="'Menu'" />
						</div>
						<div
							v-for="(course, courseIdx) in adultMenu"
							:key="courseIdx"
							class="menu-content px-4"
							:class="{ 'mt-3': courseIdx }"
						>
							<div class="font-script text-body h1 text-center mb-3" v-text="courseOptions[courseIdx]" />
							<template v-for="(item, itemIdx) in course" :key="`menu-${courseIdx}-${itemIdx}`">
								<div class="d-inline" v-text="item.title" />
								<diet-indicator class="ms-2 small align-middle" :item />
								<small class="d-block text-muted mb-2" v-text="item.description" />
							</template>
						</div>
						<div class="mt-4 text-muted small text-center">
							<template v-if="adultMenu.flat().some(item => item.vegan)">
								<diet-indicator class="small align-middle" :item="{ vegan: true }" />
								Vegan
							</template>

							<template v-if="adultMenu.flat().some(item => item.vegetarian)">
								<diet-indicator class="small align-middle ms-4" :item="{ vegetarian: true }" />
								Vegatarian
							</template>

							<template v-if="adultMenu.flat().some(item => item.glutenFree)">
								<diet-indicator class="small align-middle ms-4" :item="{ glutenFree: true }" />
								Gluten Free
							</template>
						</div>
					</div>

					<!-- eslint-disable-next-line vue/no-v-html -->
					<div id="decoration-top-left" v-html="borderContent" />
					<!-- eslint-disable-next-line vue/no-v-html -->
					<div id="decoration-top-right" v-html="borderContent" />
				</div>
			</div>
		</div>
		<div
			ref="childCard"
			class="card menu-card shadow mt-4"
			data-bs-theme="light"
		>
			<div class="card-body">
				<div class="card-content">
					<div class="card-text h-100">
						<div id="menu-header" class="text-center">
							<div id="title" class="font-script text-body my-3 pb-3" v-text="'Children\'s Menu'" />
						</div>
						<div
							v-for="(course, courseIdx) in childMenu"
							:key="courseIdx"
							class="menu-content px-4"
							:class="{ 'mt-3': courseIdx }"
						>
							<div class="font-script text-body h1 text-center mb-3" v-text="courseOptions[courseIdx]" />
							<template v-for="(item, itemIdx) in course" :key="`menu-${courseIdx}-${itemIdx}`">
								<div class="d-inline" v-text="item.title" />
								<diet-indicator class="ms-2 small align-middle" :item />
								<small class="d-block text-muted mb-2" v-text="item.description" />
							</template>
						</div>
						<div class="mt-4 text-muted text-center w-66 mx-auto">
							Children aged 12 and up also have the option of a junior portion of the adult menu.
						</div>
						<div class="mt-4 text-muted small text-center">
							<template v-if="childMenu.flat().some(item => item.vegan)">
								<diet-indicator class="small align-middle" :item="{ vegan: true }" />
								Vegan
							</template>

							<template v-if="childMenu.flat().some(item => item.vegetarian)">
								<diet-indicator class="small align-middle ms-4" :item="{ vegetarian: true }" />
								Vegatarian
							</template>

							<template v-if="childMenu.flat().some(item => item.glutenFree)">
								<diet-indicator class="small align-middle ms-4" :item="{ glutenFree: true }" />
								Gluten Free
							</template>
						</div>
					</div>

					<!-- eslint-disable-next-line vue/no-v-html -->
					<div id="decoration-top-left" v-html="borderContent" />
					<!-- eslint-disable-next-line vue/no-v-html -->
					<div id="decoration-top-right" v-html="borderContent" />
				</div>
			</div>
		</div>
	</card-body>
</template>

<style lang="scss" scoped>
$menu-border-size: 5px;

#menu-header #title {
	font-size: 3.3rem;
}

.menu-card {
	width: 600px;
	left: 0;
	margin-left: calc(50% - 300px);
	z-index: 12;
	border: none;
	user-select: none;

	hr {
		border-color: var(--bs-primary);
		color: var(--bs-primary);
		opacity: 1;
	}

	.card-body {
		width: 100%;
		padding: $menu-border-size;
		border: 2px solid var(--bs-primary);

		&::before,
		&::after {
			content: ' ';
			position: absolute;
			width: 3 * $menu-border-size;
			height: 3 * $menu-border-size;
			font-size: 3 * $menu-border-size;
			color: var(--bs-primary);
			border: 2px solid var(--bs-primary);
			line-height: 3 * $menu-border-size;
			top: calc($menu-border-size + 2px);
			text-align: center;
		}

		&::before {
			left: calc($menu-border-size + 2px);
		}

		&::after {
			right: calc($menu-border-size + 2px);
		}

		.card-content {
			border: 2px solid var(--bs-primary);
			height: 100%;
			padding: 1rem;

			&::before,
			&::after {
				content: ' ';
				position: absolute;
				width: 3 * $menu-border-size;
				height: 3 * $menu-border-size;
				font-size: 3 * $menu-border-size;
				color: var(--bs-primary);
				border: 2px solid var(--bs-primary);
				line-height: 3 * $menu-border-size;
				bottom: calc($menu-border-size + 2px);
				text-align: center;
			}

			&::before {
				left: calc($menu-border-size + 2px);
			}

			&::after {
				right: calc($menu-border-size + 2px);
			}
		}
	}

	.card-text {
		font-size: medium;
	}
}

#decoration-top-left,
#decoration-top-right {
	position: absolute;
	top: $menu-border-size * 2;
}

#decoration-top-left {
	left: $menu-border-size * 2;
}

#decoration-top-right {
	right: $menu-border-size * 2;
	transform: rotate(90deg);
}
</style>
