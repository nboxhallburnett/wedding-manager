<script setup>
const source = SOURCE;
</script>

<template>
	<div class="card-body">
		<h4 class="card-title">
			About
		</h4>
		<div class="card-text">
			Source:<br>
			<a :href="source" v-text="source" />
		</div>
	</div>
</template>

<style lang="scss" scoped>
</style>
