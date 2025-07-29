<script setup>
import CardHeader from 'components/CardHeader.vue';

// The source code's repository, set from webpack
const source = SOURCE;

// TODO: Source these from somewhere. Conf? Another db collection?
const questions = [
	{ q: 'How are you doing today?', a: 'Very well, thank you very much for asking!' },
	{ q: 'Do you believe in life after love?', a: 'What do you mean after love? This is a website for a couple getting married. Read the room.' },
	{ q: 'This website looks great, where did you get it?', a: 'Nathan made it! If you want one just like it too, it\'s open source:' }
];
</script>

<template>
	<card-header>
		Q<span class="font-script h2 lh-0 px-1">&</span>A
	</card-header>
	<div v-for="(item, idx) in questions" :key="idx" :class="{ 'pt-2': !idx }">
		<hr v-if="idx">
		<h5 v-text="item.q" />
		<div class="text-body-secondary" v-text="item.a" />
	</div>
	<div class="card-text">
		<a :href="source" target="_blank" v-text="source" />
	</div>
</template>

<style lang="scss" scoped>
hr {
	overflow: visible;
	height: 30px;
	margin-bottom: -8px;
	margin-top: 24px;
	border-style: solid;
	border-width: 1px 0 0 0;
	border-radius: 20px;
	text-align: center;

	&:before {
		content: "";
		display: block;
		height: 30px;
		margin-top: -32px;
		border-style: solid;
		border-width: 0 0 1px 0;
		border-radius: 20px;
	}

	&:after {
		content: "§";
		display: inline-block;
		position: relative;
		top: -0.8rem;
		padding: 0 0.25em;
		background-color: var(--bs-body-bg);
	}
}
</style>
