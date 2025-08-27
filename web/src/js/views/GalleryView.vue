<script setup>
import 'bootstrap/js/dist/carousel';

import { useTemplateRef, ref, onMounted } from 'vue';
import Modal from 'bootstrap/js/dist/modal';

import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';

/** @type {Ref<Image[]>} */
const items = ref([]);
const galleryLoading = ref(true);
const showModal = ref(false);

// Fetch the gallery content from the API
useLoader('gallery', items, galleryLoading, true);

const $modal = useTemplateRef('modal');
const bsModal = ref(null);
onMounted(() => {
	bsModal.value = new Modal($modal.value);
	// Toggle the showModal ref value when the bootstrap modal changes visibility state
	$modal.value.addEventListener('show.bs.modal', () => showModal.value = true);
	$modal.value.addEventListener('hidden.bs.modal', () => showModal.value = false);
});
</script>

<template>
	<div class="card-body">
		<card-header title="Gallery" />
		<div class="card-text">
			<div v-if="galleryLoading || showModal" class="img-thumbnail placeholder-glow">
				<div class="ratio ratio-4x3 placeholder" />
			</div>

			<teleport defer to="#modal-content" :disabled="!showModal">
				<div
					v-if="!galleryLoading"
					id="gallery-carousel"
					class="carousel slide"
					:class="{ 'img-thumbnail': !showModal, 'carousel-fade': showModal }"
				>
					<div class="carousel-indicators">
						<button
							v-for="(_src, idx) in items"
							:key="idx"
							type="button"
							data-bs-target="#gallery-carousel"
							:class="{ active: idx === 0, 'd-none': showModal }"
							:data-bs-slide-to="idx"
							aria-current="true"
							:aria-label="`Image ${idx + 1}`"
						/>
					</div>
					<div class="carousel-inner" :class="showModal ? '' : 'ratio ratio-4x3'">
						<div
							v-for="(item, idx) in items"
							:key="idx"
							class="carousel-item"
							:class="{ active: idx === 0 }"
						>
							<img
								:src="item.path"
								:class="{ 'modal-image mx-auto': showModal }"
								class="d-block img-fluid"
								alt="..."
								@click="bsModal.toggle()"
							>
							<div v-if="item.caption" class="carousel-caption bg-dark bg-opacity-50 pb-0 mb-3 pt-3" :class="{ 'd-none': showModal }">
								<p class="text-white" v-text="item.caption" />
							</div>
						</div>
					</div>
					<button
						class="carousel-control-prev"
						type="button"
						:class="{ 'position-fixed': showModal }"
						data-bs-target="#gallery-carousel"
						data-bs-slide="prev"
					>
						<span class="carousel-control-prev-icon bg-dark bg-opacity-75 rounded-3 py-4" aria-hidden="true" />
						<span class="visually-hidden">Previous</span>
					</button>
					<button
						class="carousel-control-next"
						type="button"
						:class="{ 'position-fixed': showModal }"
						data-bs-target="#gallery-carousel"
						data-bs-slide="next"
					>
						<span class="carousel-control-next-icon bg-dark bg-opacity-75 rounded-3 py-4" aria-hidden="true" />
						<span class="visually-hidden">Next</span>
					</button>
				</div>
			</teleport>

			<div
				id="imageModal"
				ref="modal"
				class="modal fade"
				tabindex="-1"
				aria-hidden="true"
			>
				<div class="modal-dialog modal-fullscreen">
					<div class="modal-content bg-transparent">
						<div class="modal-body text-center align-content-center">
							<div id="modal-content" />
							<button
								type="button"
								class="btn-close btn-close-white position-absolute top-0 end-0 bg-opacity-75 rounded-3 m-2 p-2 z-2 pointer"
								data-bs-dismiss="modal"
								aria-label="Close"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.carousel-item {
	img:not(.modal-image) {
		object-fit: cover;
		cursor: zoom-in;
	}

	.carousel-caption {
		inset: 0 0 auto;
	}
}

.modal-image {
	max-width: 100%;
	max-height: calc(100vh - (var(--bs-modal-padding) * 2));
	cursor: zoom-out;
}
</style>
