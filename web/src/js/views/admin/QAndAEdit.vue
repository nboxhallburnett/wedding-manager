<script setup>
import { inject, ref } from 'vue';
import { VueShowdown } from 'vue-showdown';
import { nanoid } from 'nanoid';

import { dateExtension } from 'lib/showdown';
import { useForm } from 'composables/form';
import { useLoader } from 'composables/loader';

import CardBody from 'components/CardBody.vue';
import FormInput from 'components/form/FormInput.vue';
import FormTextarea from 'components/form/FormTextarea.vue';
import FormSwitch from 'components/form/FormSwitch.vue';

/** @type {AddToast} */
const addToast = inject('addToast');
/** @type {Ref<Question[]>} */
const items = ref([]);

// Fetch the Q&A content from the API
useLoader('question', response => {
	items.value = response.result.data.map(i => ({ id: nanoid(), ...i }));
});

const { onSubmit } = useForm({
	path: 'question',
	method: 'PUT',
	validation: true,
	body() {
		return {
			items: items.value.map(i => ({
				title: i.title,
				answer: i.answer,
				markdown: i.markdown
			}))
		};
	},
	onSuccess() {
		addToast({
			title: 'Q&A items Updated',
			body: 'Q&A page items successfully saved.'
		});
	}
});

/**
 * Add a new item to the array
 */
function addItem() {
	items.value.push({
		id: nanoid(),
		title: '',
		answer: '',
		markdown: false
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
	<card-body title="Edit Q&A Items" :back="{ name: 'Admin Overview' }" :on-submit>
		<form class="card-text needs-validation" novalidate @submit.prevent.stop="onSubmit">
			<transition-group name="list" tag="div">
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
						v-model="item.title"
						:name="`question-${item.id}`"
						label="Question"
						placeholder="What is the meaning of life?"
						validation="Can't have an answer without a question"
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
					</form-input>
					<form-textarea
						v-model="item.answer"
						:name="`answer-${item.id}`"
						label="Answer"
						placeholder="42"
						validation="Can't have a question without an answer"
						required
					>
						<template #below>
							<div class="img-thumbnail p-2 text-body-secondary">
								<vue-showdown
									v-if="item.markdown"
									:markdown="item.answer || 'Preview'"
									:extensions="[ dateExtension ]"
									flavor="github"
								/>
								<div v-else v-text="item.answer || 'Preview'" />
							</div>
						</template>
					</form-textarea>
					<form-switch v-model="item.markdown" :name="`markdown-${item.id}`" label="Markdown" />
				</div>
			</transition-group>
			<button
				role="button"
				class="btn btn-primary"
				@click.prevent.stop="addItem"
				v-text="'Add Question'"
			/>
		</form>
	</card-body>
</template>
