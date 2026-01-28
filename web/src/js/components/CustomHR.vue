<script setup>
import { ref } from 'vue';

// Get the bride and groom's first initial for use as the content in alternating Q&A dividers
const brideInitial = String(CONFIG.bride).toUpperCase().charAt(0);
const groomInitial = String(CONFIG.groom).toUpperCase().charAt(0);
const dividerAlternatingContent = ref(`"${brideInitial}⚭${groomInitial}"`);
</script>

<template>
	<hr class="fancy-hr">
</template>

<style lang="scss" scoped>
hr.fancy-hr::after {
	content: v-bind(dividerAlternatingContent);
}
</style>
