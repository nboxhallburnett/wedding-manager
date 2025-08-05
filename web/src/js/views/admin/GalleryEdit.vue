<script setup>
import { inject, ref } from 'vue';
import { nanoid } from 'nanoid';

import { useForm } from 'composables/form';
import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';
import FormInput from 'components/form/FormInput.vue';

/** @type {AddToast} */
const addToast = inject('addToast');
/** @type {Ref<Image[]>} */
const items = ref([]);

// Fetch the gallery content from the API
useLoader('gallery', response => {
	items.value = response.result.data.map(i => ({ id: nanoid(), ...i }));
});

const { onSubmit } = useForm({
	path: 'gallery',
	method: 'PUT',
	validation: true,
	body() {
		return {
			items: items.value.map(i => {
				const item = {
					path: i.path
				};
				if (i.caption) {
					item.caption = i.caption;
				}
				return item;
			})
		};
	},
	onSuccess() {
		addToast({
			title: 'Gallery items Updated',
			body: 'Gallery page items successfully saved.'
		});
	}
});

/**
 * Add a new item to the array
 */
function addItem() {
	items.value.push({
		id: nanoid(),
		path: '',
		caption: ''
	});
}
/**
 * Remove an item from the list
 *
 * @param {Number} idx Index of the item to remove
 */
function removeItem(idx) {
	items.value.splice(idx, 1);
}
/**
 * Moves an item in the list
 *
 * @param {Number} idx Index of the item to move
 * @param {Number} to Index to move the item to
 */
function moveItem(idx, to) {
	[ items.value[idx], items.value[to] ] = [ items.value[to], items.value[idx] ];
}
</script>

<template>
	<card-header title="Edit Gallery Items">
		<button class="btn btn-primary btn-sm" type="submit" @click="onSubmit">
			Submit
		</button>
	</card-header>
	<form class="needs-validation card-text" novalidate @submit.prevent.stop="onSubmit">
		<div v-for="(item, idx) in items" :key="item.id">
			<div v-if="idx" class="d-flex align-items-center pb-3">
				<hr class="fancy-hr w-100">
				<div class="d-flex flex-column gap-1">
					<button
						:id="`item-${item.idx}-up`"
						class="icon-caret rotate-180 fs-4 p-0"
						type="button"
						@click.prevent.stop="moveItem(idx, idx - 1)"
					/>
					<button
						v-if="items[idx + 1]"
						:id="`item-${item.idx}-down`"
						class="icon-caret fs-4 p-0"
						type="button"
						@click.prevent.stop="moveItem(idx, idx + 1)"
					/>
				</div>
			</div>
			<form-input
				v-model="item.path"
				:name="`question-${item.id}`"
				label="Path"
				placeholder="/img/gallery/1.jpg"
				required
			>
				<template #after>
					<button
						type="button"
						class="btn btn-sm btn-danger ms-auto"
						@click="removeItem(idx)"
					>
						<div class="btn-close btn-close-white" />
						<div class="visually-hidden">
							Remove
						</div>
					</button>
				</template>
				<template v-if="item.path" #below>
					<img class="img-thumbnail" :src="item.path" alt="Preview">
				</template>
			</form-input>
			<form-input
				v-model="item.caption"
				:name="`caption-${item.id}`"
				label="Caption"
				placeholder="The happy couple enjoying life"
			/>
		</div>
		<button
			role="button"
			class="btn btn-primary"
			@click.prevent.stop="addItem"
			v-text="'Add Item'"
		/>
	</form>
</template>
