<script setup>
import 'bootstrap/js/dist/carousel';

import { useTemplateRef, ref, onMounted } from 'vue';
import Modal from 'bootstrap/js/dist/modal';

import { useLoader } from 'composables/loader';

import CardBody from 'components/CardBody.vue';
import CardHeader from 'components/CardHeader.vue';

/** @type {Ref<Image[]>} */
const items = ref([]);
const galleryLoading = ref(true);
const showModal = ref(false);
const preferredType = ref(null);

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

/**
 * Check whether the current browser supports the image format defined in a given data url
 *
 * @param {String} dataUrl image date url to check
 * @returns {Boolean}
 */
async function supportsFormat(dataUrl) {
	if (!window.createImageBitmap) {
		return Promise.reject(false);
	}

	try {
		const blob = await fetch(dataUrl).then(response => response.blob());
		await createImageBitmap(blob);
		return true;
	} catch (err) {
		console.warn('Error checking image format support:', err);
		return Promise.reject(false);
	}
}

// Check support for AVIF or WebP formats to determine the most optimal format to use on initial render, falling back to jpeg.
// This determines which images are used on the zoomed out initial render, with the raw images being used in place when zoomed in.
const avifData = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUEAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABYAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgSAAAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB5tZGF0EgAKBzgADlAgIGkyCR/wAABAAACvcA==';
const webpData = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEAAQAcJaQAA3AA/v3AgAA=';
supportsFormat(avifData).then(() => 'avif')
	.catch(() => supportsFormat(webpData).then(() => 'webp'))
	.catch(() => 'jpeg')
	.then(value => preferredType.value = value);
</script>

<template>
	<card-body>
		<card-header title="Gallery" />
		<div class="card-text">
			<div v-if="galleryLoading || showModal || preferredType === null" class="img-thumbnail placeholder-glow">
				<div class="ratio ratio-4x3 placeholder" />
			</div>

			<teleport defer to="#modal-content" :disabled="!showModal">
				<div
					v-if="!galleryLoading && preferredType"
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
								:src="showModal ? item.path : `/api/gallery${item.path}?type=${preferredType}`"
								:class="{ 'modal-image mx-auto': showModal }"
								class="d-block img-fluid"
								:alt="item.caption || 'Gallery Image'"
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
	</card-body>
</template>

<style lang="scss" scoped>
.img-thumbnail {
	margin-left: auto;
	margin-right: auto;
	max-width: 768px;
}

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
