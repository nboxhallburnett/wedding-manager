<script setup>
import { dateFormatter } from 'lib/formatter';

const navItems = CONFIG.client.footer;

const date = dateFormatter.format(CONFIG.date);
// Calculate number of days from now until the configured date
const daysToGo = Math.floor((CONFIG.date - Date.now()) / (1000 * 60 * 60 * 24));
</script>

<template>
	<nav id="footer" class="navbar navbar-expand navbar-light px-3 mt-auto bg-blur d-md-none">
		<div id="navbarFooter" class="collapse navbar-collapse">
			<div class="navbar-nav w-100 justify-content-between">
				<div class="d-flex">
					<template v-for="(item, idx) in navItems" :key="item.text">
						<template v-if="idx">
							|
						</template>
						<a :href="item.url" class="nav-item nav-link text-stroke" target="_blank">
							{{ item.text }}
						</a>
					</template>
				</div>
				<div class="d-flex text-stroke">
					<template v-if="daysToGo > 0">
						<div class="nav-item nav-link text-stroke pointer">
							{{ daysToGo }} Days
						</div>
						|
					</template>
					<div class="nav-item nav-link pointer text-stroke" v-text="date" />
				</div>
			</div>
		</div>
	</nav>
	<div id="footer-md" class="d-none d-md-flex container-fluid">
		<div id="col-left" class="col">
			<div v-for="item in navItems" :key="item.text" class="v-footer-item mb-4">
				<a :href="item.url" class="nav-item nav-link text-stroke" target="_blank">
					{{ item.text }}
				</a>
			</div>
		</div>

		<div class="col-xxl-7 col-xl-8 col-lg-9 col-md-10 col-sm-11" />

		<div id="col-right" class="col align-content-end">
			<div id="footer-date" class="v-footer-item">
				<div class="nav-item nav-link text-stroke" v-text="date" />
				<div v-if="daysToGo > 0" class="nav-item nav-link text-stroke">
					{{ daysToGo }} Days
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
#footer {
	z-index: 10;
	position: fixed;
	height: var(--footer-height);
	bottom: 0;
	width: 100%;

	.nav-item {
		padding-top: 0;
		padding-bottom: 0;
	}

	div.nav-item {
		cursor: default;
	}
}

#footer-md {
	position: fixed;
	height: calc(100% - var(--header-height));
	width: 100%;

	.v-footer-item {
		margin-left: auto;
		margin-right: auto;
		writing-mode: vertical-lr;
		line-height: 1.2em;
		border-radius: 8px;
		text-align: center;
		padding: 0.5rem 0.25rem;
		backdrop-filter: blur(10px) saturate(150%);
		background-color: rgb(var(--bs-primary-rgb), 20%);
	}

	#footer-date {
		cursor: default;
	}

	#col-left .v-footer-item {
		transform: rotate(180deg);

		&:first-child {
			margin-top: 15vh;
		}
	}

	#col-right .v-footer-item {
		margin-top: auto;
		margin-bottom: 15vh;
	}

	#col-left,
	#col-right {
		position: relative;
		font-size: small;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			right: calc(50% - 1px);
			height: 100%;
			width: 2px;
			backdrop-filter: blur(10px) saturate(150%);
			background-color: rgb(var(--bs-primary-rgb), 20%);
		}
	}
}
</style>
