<script setup>
import { inject } from 'vue';

const loading = inject('loading');
const rsvpCode = defineModel({ type: String });

// TODO: wire this up
function onClick() {
	loading.value = true;
}

</script>

<template>
	<div class="card-body">
		<h5 class="card-title">
			Manage your RSVP
		</h5>
		<p class="card-text">
			Enter the RSVP code included on your invitation below.
		</p>
		<input
			v-model="rsvpCode"
			class="form-control mb-3"
			type="text"
			placeholder="Enter your RSVP code"
		>
		<button :disabled="!rsvpCode" class="btn btn-primary w-100" @click="onClick">
			Submit
		</button>
	</div>
</template>
