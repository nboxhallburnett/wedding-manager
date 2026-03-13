<script setup>
import { inject } from 'vue';

import CardBody from 'components/CardBody.vue';

const invitation = inject('invitation');

const palettes = CONFIG.client.palette;
</script>

<template>
	<card-body title="Colour Scheme" :back="{ name: invitation.admin ? 'Admin Overview' : 'Q&A' }">
		<div class="row text-center justify-content-around py-1 gap-3">
			<div v-for="palette in Object.entries(palettes)" :key="palette[0]" class="col-auto">
				<div class="d-flex flex-row flex-fill justify-content-center fw-bold" v-text="palette[0].charAt(0).toUpperCase() + palette[0].slice(1)" />
				<div class="d-flex flex-fill justify-content-center gap-5">
					<div v-for="item in palette[1]" :key="item.value" class="d-flex flex-column">
						<div class="palette-preview" :style="`--palette-colour:${item.value};`" />
						{{ item.name }}
						<template v-if="invitation.admin">
							<br>{{ item.value }}
						</template>
					</div>
				</div>
			</div>
		</div>
	</card-body>
</template>

<style lang="scss" scoped>
.palette-preview {
	$size: 10vmin;

	margin: 1rem auto;
	width: $size;
	height: $size;
	border-radius: 50%;
	background-color: var(--palette-colour);
	box-shadow:
		0 0 0 2px white,
		0 0 0 4px black;
}
</style>
