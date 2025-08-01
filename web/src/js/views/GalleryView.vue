<script setup>
import 'bootstrap/js/dist/carousel';

import { useTemplateRef, ref, onMounted } from 'vue';
import Modal from 'bootstrap/js/dist/modal';

import { useLoader } from 'composables/loader';

import CardHeader from 'components/CardHeader.vue';

/** @type {Ref<Image[]>} */
const items = ref([]);

// Fetch the gallery content from the API
useLoader('gallery', items);

const $modal = useTemplateRef('modal');
const $modalImage = useTemplateRef('modalImage');
const bsModal = ref(null);
onMounted(() => bsModal.value = new Modal($modal.value));

function fullscreenImage(src) {
	$modalImage.value.src = src;
	bsModal.value.show();
}
</script>

<template>
	<card-header title="Gallery" />
	<div class="card-text">
		<div id="gallery-carousel" class="carousel slide img-thumbnail" data-bs-ride="carousel">
			<div class="carousel-indicators">
				<button
					v-for="(_src, idx) in items"
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
					v-for="(item, idx) in items"
					:key="idx"
					class="carousel-item"
					:class="{ active: idx === 0 }"
				>
					<img
						:src="item.path"
						class="d-block w-100 img-fluid"
						alt="..."
						@click.prevent="fullscreenImage(item.path)"
					>
					<div v-if="item.caption" class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 pb-0 mb-3 pt-3">
						<p class="text-white" v-text="item.caption" />
					</div>
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
						ref="modalImage"
						src=""
						class="img-fluid"
						alt="Full Screen Image"
					>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.carousel-item {
	img {
		object-fit: cover;
		cursor: zoom-in;
	}

	.carousel-caption {
		top: 0;
		left: 0;
		right: 0;
		bottom: auto;
	}
}

#modalImage {
	max-width: 100%;
	max-height: 100%;
}
</style>
