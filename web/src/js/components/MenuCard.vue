<script setup>
import { computed, ref, onMounted, useTemplateRef, nextTick } from 'vue';
import DietIndicator from 'components/DietIndicator.vue';

const reStyleFill = /{fill:(#?\w+)}/;
const courseOptions = [ 'Starter', 'Main', 'Dessert' ];

const props = defineProps({
	menu: { type: Array, default: () => [] },
	title: { type: String, default: '' },
	table: { type: String, default: null },
	offsetTitle: { type: Boolean, default: false },
	offsetFooter: { type: Boolean, default: false },
	disclaimer: { type: String, default: '' },
	dietIndicators: { type: Boolean, default: false }
});

const $card = useTemplateRef('card');
defineExpose({ $card });

const cornerContent = ref('');
const cornerDecorationSize = ref('0px');
const $cornerDecoration = useTemplateRef('cornerDecoration');
const dividerContent = ref('');

onMounted(async () => {
	// Fetch the themed colours to use for the border content
	const primaryColour = getComputedStyle($card.value).getPropertyValue('--bs-primary');

	// Fetch the ring and border svg content from the server
	const [
		cornerSvg,
		dividerSvg
	] = await Promise.all([
		fetch('/img/invitation/corner.svg'),
		fetch('/img/invitation/divider.svg')
	]);
	// Get their text value
	const [
		cornerSvgContent,
		dividerSvgContent
	] = await Promise.all([
		cornerSvg.text(),
		dividerSvg.text()
	]);

	cornerContent.value = cornerSvgContent
		// Replace the corner fill colour with the themed primary colour
		.replace(reStyleFill, `{fill:${primaryColour}}`);
	dividerContent.value = dividerSvgContent
		// Replace the divider fill colour with the themed primary colour
		.replace(reStyleFill, `{fill:${primaryColour}}`);

	await nextTick();
	const cornerWidth = $cornerDecoration.value.getBoundingClientRect().width;
	cornerDecorationSize.value = `${cornerWidth}px`;
});

const hasMenu = computed(() => {
	return Boolean(props.menu.flat().length);
});
</script>

<template>
	<div
		ref="card"
		class="card menu-card shadow mb-4"
		data-bs-theme="light"
	>
		<div class="card-body">
			<div class="card-content">
				<div class="card-text h-100 my-4 mx-4">
					<div
						id="menu-header"
						class="text-center my-4"
						:class="{ 'pb-3': table && hasMenu, offset: table && !hasMenu }"
					>
						<div id="title" class="font-script lh-1 text-body" v-text="props.title" />
						<div v-if="table" class="text-muted" v-text="`Table ${table}`" />
					</div>
					<!-- eslint-disable-next-line vue/no-v-html -->
					<div v-if="table && hasMenu" id="divider" class="text-center mb-5">
						<div v-html="dividerContent" />
					</div>
					<template v-for="(course, courseIdx) in menu" :key="courseIdx">
						<div v-if="course.length" class="menu-content" :class="{ 'mt-3': courseIdx }">
							<div class="font-script text-body h1 text-center mb-2 mt-4" v-text="courseOptions[courseIdx]" />
							<template v-for="(item, itemIdx) in course" :key="`menu-${courseIdx}-${itemIdx}`">
								<div class="d-inline" v-text="item?.title" />
								<diet-indicator v-if="dietIndicators" class="ms-2 small align-middle" :item />
								<small class="d-block text-muted mb-2" v-text="item?.description" />
							</template>
						</div>
					</template>
					<div v-if="disclaimer" class="mt-4 text-muted text-center w-66 mx-auto" v-text="disclaimer" />
					<div v-if="props.dietIndicators" id="menu-footer" class="mt-4 text-muted small text-center" :class="{ offset: props.offsetFooter }">
						<template v-if="props.menu.flat().some(item => item?.vegan)">
							<diet-indicator class="small align-middle" :item="{ vegan: true }" />
							Vegan
						</template>

						<template v-if="props.menu.flat().some(item => item?.vegetarian && !item.vegan)">
							<diet-indicator class="small align-middle ms-4" :item="{ vegetarian: true }" />
							Vegetarian
						</template>

						<template v-if="props.menu.flat().some(item => item?.gluten_free)">
							<diet-indicator class="small align-middle ms-4" :item="{ gluten_free: true }" />
							Gluten-Free
						</template>
					</div>
				</div>

				<!-- eslint-disable-next-line vue/no-v-html -->
				<div v-if="!table" id="decoration-top-left" class="rotate-180" v-html="cornerContent" />
				<!-- eslint-disable-next-line vue/no-v-html -->
				<div id="decoration-bottom-right" ref="cornerDecoration" v-html="cornerContent" />
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
$menu-border-size: 5px;
$corner-decoration-offset-x: -188px;
$corner-decoration-offset-y: -135px;
$corner-decoration-size: v-bind(cornerDecorationSize);
$corner-decoration-offset: calc(calc($corner-decoration-size + $corner-decoration-offset-x) * 1.66);

#menu-header #title {
	font-size: 3.3rem;
}

.menu-card {
	width: 600px;
	left: 0;
	margin-left: calc(50% - 300px);
	border: none;
	user-select: none;
	overflow: hidden;

	hr {
		border-color: var(--bs-primary);
		color: var(--bs-primary);
		opacity: 1;
	}

	.card-body {
		width: 100%;
		padding: 1rem;
		border: 2px solid var(--bs-primary);
		border-radius: 5px;
	}

	.card-text {
		font-size: medium;
	}
}

.offset {
	margin-right: $corner-decoration-offset;
}

#divider {
	height: 0;
	transform: rotate(90deg) scale(0.9);

	> div {
		transform: translateY(-50%);
	}
}

#decoration-top-left,
#decoration-bottom-right {
	position: absolute;
	scale: 60%;
}

#decoration-top-left {
	top: $corner-decoration-offset-y;
	left: $corner-decoration-offset-x;
}

#decoration-bottom-right {
	bottom: $corner-decoration-offset-y;
	right: $corner-decoration-offset-x;
}
</style>
