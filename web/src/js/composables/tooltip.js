import { ref, onMounted, onUnmounted } from 'vue';
import Tooltip from 'bootstrap/js/dist/tooltip';

/**
 * Composable to handle instantiation and disposal of bootstrap tooltips.
 *
 * The returned `$els` array ref should be populated by the callee, e.g.
 * `:ref="$el => $els.push($el)"`
 *
 * @param {Tooltip.Options} options Options to apply to the tooltip instance(s)
 * @returns {{ $els: ref<Element[]>, tooltips: ref<Tooltip[]> }}
 */
export function useTooltip(options) {
	const $els = ref([]);
	const tooltips = ref([]);

	onMounted(() => {
		for (const $el of $els.value) {
			$el.setAttribute('data-bs-toggle', 'tooltip');
			$el.setAttribute('tabindex', '0');
			tooltips.value.push(new Tooltip($el, options));
		}
	});

	onUnmounted(() => {
		for (const tooltip of tooltips.value) {
			tooltip.dispose();
		}
	});

	// expose managed state as return value
	return { $els, tooltips };
}
