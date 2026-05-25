<script setup>
import { computed, ref, useTemplateRef } from 'vue';
import Router from 'router';
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
/** @type {Ref<Invitation>} */
const invitation = ref({});

const cards = {
	guests: [],
	children: []
};

useLoader([ 'menu', `invitation/${Router.currentRoute.value.params.invitationId}` ], [ menu, invitation ]);

/**
 * Trigger the download of the menu cards as PNGs
 */
async function downloadImage() {
	for (const { $el, guest } of cards.guests.concat(cards.children)) {
		const dataUrl = await toPng($el.$card, {
			cacheBust: true,
			style: { margin: 0 }
		});
		const menuLink = document.createElement('a');
		menuLink.download = `place_card_${guest.name.toLowerCase().replaceAll(' ', '_')}.png`;
		menuLink.href = dataUrl;
		menuLink.click();

		await new Promise(resolve => setTimeout(() => resolve(), 200));
	}
}

function getMenu(guest) {
	return [
		[ menu.value.find(item => item.id === guest.starter_id) ],
		[ menu.value.find(item => item.id === guest.main_id) ],
		[ menu.value.find(item => item.id === guest.dessert_id) ]
	];
}
</script>

<template>
	<card-body>
		<card-header title="Place Cards">
			<router-link class="btn btn-link btn-sm me-2" :to="{ name: 'Admin View Invitation' }">
				Back
			</router-link>
			<button class="btn btn-primary btn-sm" @click="downloadImage">
				Download
			</button>
		</card-header>
		<template v-for="(guest, idx) in invitation.guests" :key="idx">
			<menu-card
				v-if="guest.status_ceremony === 1 || guest.status_ceremony === 2"
				:key="idx"
				:ref="$el => cards.guests[idx] = { $el, guest }"
				:title="guest.name"
				:menu="getMenu(guest)"
				offset-title
			/>
		</template>
		<template v-for="(child, idx) in invitation.children" :key="idx">
			<menu-card
				v-if="child.starter_id || child.main_id || child.dessert_id"
				:ref="$el => cards.children[idx] = { $el, guest: child }"
				:title="child.name"
				:menu="getMenu(child)"
				offset-title
			/>
		</template>
	</card-body>
</template>
