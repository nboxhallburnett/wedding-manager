<script setup>
import { RouterLink } from 'vue-router';

const bride = CONFIG.bride_short;
const groom = CONFIG.groom_short;

const props = defineProps({
	title: { type: String, default: '' },
	action: { type: Object, default: null },
	back: { type: Object, default: null },
	onSubmit: { type: Function, default: null },
	noTitle: { type: Boolean, default: false }
});

// Unless disabled, set the document title to the card title
if (!props.noTitle) {
	document.title = `${props.title} | ${bride} & ${groom} | Wedding`;
}
</script>

<template>
	<h4 class="card-title d-flex justify-content-between border-bottom pb-3 bg-body">
		<span v-if="title" v-text="title" />
		<span>
			<slot>
				<router-link v-if="back" class="btn btn-link btn-sm me-2" :to="back">
					Back
				</router-link>
				<router-link v-if="action?.to && action?.text" class="btn btn-primary btn-sm" :to="action.to">
					{{ action.text }}
				</router-link>
				<button
					v-if="onSubmit"
					class="btn btn-primary btn-sm"
					type="submit"
					@click.prevent.stop="onSubmit"
				>
					Submit
				</button>
			</slot>
		</span>
	</h4>
</template>
