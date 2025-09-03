<script setup>
import CardBody from 'components/CardBody.vue';

const palette = CONFIG.client.palette;
</script>

<template>
	<card-body title="Colour Palette" :back="{ name: 'Admin Overview' }">
		<div class="row text-center">
			<div v-for="item in palette" :key="item.value" class="col">
				<div class="palette-preview" :style="`--palette-colour:${item.value};`" />
				{{ item.name }}
				<br>{{ item.value }}
			</div>
		</div>
	</card-body>
</template>

<style lang="scss" scoped>
.palette-preview {
	$size: 80px;

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
