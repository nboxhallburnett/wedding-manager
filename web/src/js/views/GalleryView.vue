<script setup>
import 'bootstrap/js/dist/carousel';

import { ref } from 'vue';
import Modal from 'bootstrap/js/dist/modal';

const gallerySources = GALLERY_IMAGES;

/** @type {Ref<Element>} */
const modal = ref(null);
function fullscreenImage(evt) {
	evt.preventDefault();
	const imageUrl = evt.target?.getAttribute('src');
	if (imageUrl) {
		const modalImage = document.getElementById('modalImage');
		modalImage.src = imageUrl;
		const imageModal = new Modal(modal.value);
		imageModal.show();
	}
}
</script>

<template>
	<div class="card-body">
		<h4 class="card-title mb-3">
			Gallery
		</h4>
		<div class="card-text">
			<div id="gallery-carousel" class="carousel slide img-thumbnail" data-bs-ride="carousel">
				<div class="carousel-indicators">
					<button
						v-for="(_src, idx) in gallerySources"
						:key="idx"
						type="button"
						data-bs-target="#gallery-carousel"
						:class="{ active: idx === 0 }"
						:data-bs-slide-to="idx"
						aria-current="true"
						:aria-label="`Image ${idx + 1}`"
					/>
				</div>
				<div class="carousel-inner ratio ratio-4x3">
					<div
						v-for="(src, idx) in gallerySources"
						:key="idx"
						class="carousel-item"
						:class="{ active: idx === 0 }"
					>
						<img
							:src="`/img/gallery/${src}`"
							class="d-block w-100 img-fluid"
							alt="..."
							@click="fullscreenImage"
						>
					</div>
				</div>
				<button
					class="carousel-control-prev"
					type="button"
					data-bs-target="#gallery-carousel"
					data-bs-slide="prev"
				>
					<span class="carousel-control-prev-icon bg-dark bg-opacity-75 rounded-3 py-4" aria-hidden="true" />
					<span class="visually-hidden">Previous</span>
				</button>
				<button
					class="carousel-control-next"
					type="button"
					data-bs-target="#gallery-carousel"
					data-bs-slide="next"
				>
					<span class="carousel-control-next-icon bg-dark bg-opacity-75 rounded-3 py-4" aria-hidden="true" />
					<span class="visually-hidden">Next</span>
				</button>
			</div>

			<div
				id="imageModal"
				ref="modal"
				class="modal fade"
				tabindex="-1"
				aria-hidden="true"
			>
				<div class="modal-dialog modal-fullscreen">
					<div class="modal-body h-100 text-center align-content-center">
						<button
							type="button"
							class="btn-close position-absolute p-3 end-0 bg-light me-4 mt-1 pointer"
							data-bs-dismiss="modal"
							aria-label="Close"
						/>
						<img
							id="modalImage"
							src=""
							class="img-fluid"
							alt="Full Screen Image"
						>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.carousel-item img {
	// max-height: 400px;
	object-fit: cover;
	cursor: zoom-in;
}

#modalImage {
	max-width: 100%;
	max-height: 100%;
}
</style>
