import { ref, onMounted, onUnmounted } from 'vue';
import Popover from 'bootstrap/js/dist/popover.js';

// Add table elements to the html content allowlist
Popover.Default.allowList.table = [];
Popover.Default.allowList.tbody = [];
Popover.Default.allowList.tr = [];
Popover.Default.allowList.td = [];

/**
 * Composable to handle instantiation and disposal of bootstrap popovers.
 *
 * The returned `$els` array ref should be populated by the callee, e.g.
 * `:ref="$el => $els.push($el)"`
 *
 * @param {Popover.Options} options Options to apply to the popover instance(s)
 * @returns {{ $els: ref<Element[]>, popovers: ref<Popover[]> }}
 */
export function usePopover(options) {
	const $els = ref([]);
	const popovers = ref([]);

	onMounted(() => {
		for (const $el of $els.value) {
			$el.setAttribute('data-bs-toggle', 'popover');
			$el.setAttribute('tabindex', '0');
			popovers.value.push(new Popover($el, options));
		}
	});

	onUnmounted(() => {
		for (const popover of popovers.value) {
			popover.dispose();
		}
	});

	// expose managed state as return value
	return { $els, popovers };
}
