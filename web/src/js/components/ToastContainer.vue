<script setup>
import { ref, nextTick } from 'vue';
import { nanoid } from 'nanoid';
import Toast from 'bootstrap/js/dist/toast';

/** @type {Ref<Toast[]>} */
const toasts = ref([]);
/** @type {Ref<{ [key: String]: Element }>} */
const $toasts = ref({});

defineExpose({ addToast });
/** @type {AddToast} */
function addToast(toast, options = { animation: true, autohide: true }) {
	toast.id = nanoid();
	toasts.value.push(toast);
	nextTick(() => {
		const $toast = $toasts.value[toast.id];
		const bsToast = new Toast($toast, options);
		bsToast.show();
		$toast.addEventListener('hidden.bs.toast', () => {
			toasts.value.splice(toasts.value.findIndex(t => t.id === toast.id), 1);
		});
	});
}

</script>

<template>
	<div id="toast-container" aria-live="polite" aria-atomic="true">
		<div class="toast-container position-fixed end-0 p-3">
			<div
				v-for="toast in toasts"
				:key="toast.id"
				:ref="$el => $toasts[toast.id] = $el"
				class="toast"
				role="alert"
				aria-live="assertive"
				aria-atomic="true"
			>
				<div class="toast-header">
					<strong class="me-auto" v-text="toast.title" />
					<button
						type="button"
						class="btn-close"
						data-bs-dismiss="toast"
						aria-label="Close"
					/>
				</div>
				<div class="toast-body" v-text="toast.body" />
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#toast-container {
	position: absolute;
	top: var(--header-height);
}
</style>
