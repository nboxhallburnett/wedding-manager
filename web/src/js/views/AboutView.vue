<script setup>
const source = SOURCE;
</script>

<template>
	<div class="card-body">
		<h5 class="card-title">
			About
		</h5>
		<div class="card-text">
			Source:<br>
			<a :href="source" v-text="source" />
		</div>
	</div>
</template>

<style lang="scss" scoped>
</style>
