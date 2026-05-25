<script setup>
import { computed, ref, useTemplateRef } from 'vue';
// TODO: Replace this back once (if) html-to-image is updated with this merged:
// https://github.com/bubkoo/html-to-image/pull/547
import { toPng } from '@jpinsonneau/html-to-image';
// import { toBlob, toPng } from 'html-to-image';

import { useLoader } from 'composables/loader';

import CardBody from 'components/CardBody.vue';
import CardHeader from 'components/CardHeader.vue';
import MenuCard from 'components/MenuCard.vue';

/** @type {Ref<MenuItem[]>} */
const menu = ref([]);
const cards = [
	{ $el: useTemplateRef('card'), filename: 'wedding_menu_adult' },
	{ $el: useTemplateRef('childCard'), filename: 'wedding_menu_children' },
	{ $el: useTemplateRef('veganCard'), filename: 'wedding_menu_vegan' },
	{ $el: useTemplateRef('gfCard'), filename: 'wedding_menu_gluten_free' }
];

useLoader('menu', menu);

/**
 * Trigger the download of the menu cards as PNGs
 */
async function downloadImage() {
	for (const { $el, filename } of cards) {
		const dataUrl = await toPng($el.value.$card, {
			cacheBust: true,
			style: { margin: 0 }
		});
		const menuLink = document.createElement('a');
		menuLink.download = `${filename}.png`;
		menuLink.href = dataUrl;
		menuLink.click();

		await new Promise(resolve => setTimeout(() => resolve(), 200));
	}
}

const adultMenu = computed(() => {
	return menu.value?.reduce((items, item) => {
		if (item.child || item.hidden) {
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

const veganMenu = computed(() => {
	return menu.value.reduce((items, item) => {
		if (item.child || !item.vegan) {
			return items;
		}
		items[item.course].push(item);
		return items;
	}, [ [], [], [] ]);
});

const gfMenu = computed(() => {
	return menu.value.reduce((items, item) => {
		if (item.child || !item.gluten_free) {
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
		<menu-card ref="card" title="Menu" :menu="adultMenu" diet-indicators />
		<menu-card
			ref="childCard"
			title="Children's Menu"
			disclaimer="Children aged 12 and up also have the option of a junior portion of the adult menu."
			:menu="childMenu"
			diet-indicators
			offset-footer
		/>
		<menu-card ref="veganCard" title="Vegan Menu" :menu="veganMenu" />
		<menu-card ref="gfCard" title="Gluten-Free Menu" :menu="gfMenu" />
	</card-body>
</template>
