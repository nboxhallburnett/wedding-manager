import { inject, isRef } from 'vue';

import API from 'lib/api';

/** @type {AddToast} */
let addToast;
/** @type {Ref<Boolean>} */
let loading;

/**
 * Composable to handle loading .
 *
 * @param {Promise<Response>|Promise<Response>[]|String|String[]} toLoad Options for the form to submit
 * @param {Ref|Ref[]|((response: Response|Response[]) => void)} onLoad Path of the API to call. Can either be a string or a function that returns the path
 * @param {Ref} [loadingRef] A custom ref to use instead of the global loading indicator
 *
 * @returns {void}
 */
export async function useLoader(toLoad, onLoad, loadingRef) {
	// If the addToast and loading injections aren't already defined, define them
	addToast ||= inject('addToast');
	loading ||= inject('loading');

	// Use either a custom loading ref or the global loader depending on the supplied arguments
	const _loader = loadingRef || loading;

	// If toLoad and onLoad are arrays, ensure they have the same length for the shorthand use
	if (Array.isArray(toLoad) && Array.isArray(onLoad) && onLoad.length !== toLoad.length) {
		throw new Error('toLoad and onLoad must have the same number of items');
	}

	// Ensure the set of data to fetch is an array
	let promises = Array.isArray(toLoad) ? toLoad : [ toLoad ];
	// If toLoad was passed with strings as the path for an API request, replace them with an appropriate request against it
	promises = promises.map(req => {
		if (typeof req === 'string') {
			return API(req);
		}
		return req;
	});

	// Trigger the fetches and enable the loading indicator
	_loader.value = true;
	Promise.all(promises).then((response) => {
		let hasError = false;
		for (const item of response) {
			// If a request had an error, mark the fetch as failed and trigger a toast
			if (item.status >= 400) {
				hasError = true;
				console.error(response.result?.description);
				addToast({ body: 'An error occurred while fetching data.' });
			}
		}
		// Disable the loading indicator
		_loader.value = false;

		// If any errors occurred, fall out
		if (hasError) {
			return;
		}

		// If onLoad is a single ref, set its value to the first indexes response result
		if (isRef(onLoad)) {
			return onLoad.value = response[0].result?.data;
		}
		// If onLoad is an array of refs, set their respective values from the responses
		if (Array.isArray(onLoad) && !onLoad.some(item => !isRef(item))) {
			for (const [ idx, { result } ] of response.entries()) {
				onLoad[idx].value = result?.data;
			}
			return;
		}
		// If onLoad is a function, call it with the responses
		if (typeof onLoad === 'function') {
			return onLoad(Array.isArray(toLoad) ? response : response[0]);
		}
	});
}
