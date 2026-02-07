import { inject, isRef } from 'vue';

import API from 'lib/api.js';

/** @type {AddToast} */
let addToast;
/** @type {Ref<Boolean>} */
let loading;
/** @type {Ref} */
let cache;

/**
 * Composable to handle loading.
 *
 * @param {Promise<Response>|Promise<Response>[]|String|String[]} toLoad Options for the form to submit
 * @param {Ref|Ref[]|((response: Response|Response[]) => void)} onLoad Path of the API to call. Can either be a string or a function that returns the path
 * @param {Ref} [loadingRef] A custom ref to use instead of the global loading indicator
 * @param {Boolean} [cacheable] Whether to use the in-memory cache for the result
 *
 * @returns {void}
 */
export async function useLoader(toLoad, onLoad, loadingRef, cacheable) {
	// If the addToast and loading injections aren't already defined, define them
	addToast ||= inject('addToast');
	loading ||= inject('loading');
	cache ||= inject('cache', {});

	// Use either a custom loading ref or the global loader depending on the supplied arguments
	const _loader = loadingRef || loading;

	// If toLoad and onLoad are arrays, ensure they have the same length for the shorthand use
	if (Array.isArray(toLoad) && Array.isArray(onLoad) && onLoad.length !== toLoad.length) {
		throw new Error('toLoad and onLoad must have the same number of items');
	}

	// Ensure the set of data to fetch is an array
	let promises = Array.isArray(toLoad) ? toLoad : [ toLoad ];
	const cacheKeys = [];
	// If toLoad was passed with strings as the path for an API request, replace them with an appropriate request against it
	promises = promises.map((req, idx) => {
		// If the loader has marked the requests as cacheable, and the request is passed as a string, mark that as the cache key
		if (cacheable && typeof req === 'string') {
			cacheKeys[idx] = req;
			// If a value already exists for the key in cache, return that as the value to avoid making a new call
			if (cache.value[req]) {
				return cache.value[req];
			}
		}
		// Otherwise, if the request is passed as a string convert it to an API request
		if (typeof req === 'string') {
			return API(req);
		}
		// Fall back to just use whatever we were passed
		return req;
	});

	// Trigger the fetches and enable the loading indicator
	_loader.value = !cacheable || promises.some(p => p instanceof Promise);
	return Promise.all(promises).then((response) => {
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
			// If the request was marked as cacheable and there's already a value for it in cache, use that and fall out
			if (cacheable && typeof cacheKeys[0] === 'string' && cache.value[cacheKeys[0]]) {
				return onLoad.value = cache.value[cacheKeys[0]];
			}
			// If it is cacheable and no value exists for it, set that as the cache value for future use
			if (cacheable && typeof cacheKeys[0] === 'string' && !cache.value[cacheKeys[0]]) {
				cache.value[cacheKeys[0]] = response[0].result?.data;
			}
			return onLoad.value = response[0].result?.data;
		}
		// If onLoad is an array of refs, set their respective values from the responses
		if (Array.isArray(onLoad) && !onLoad.some(item => !isRef(item))) {
			for (const [ idx, { result } ] of response.entries()) {
				// If the request was marked as cacheable and there's already a value for it in cache, use that and fall out
				if (cacheable && typeof cacheKeys[idx] === 'string' && cache.value[cacheKeys[idx]]) {
					onLoad[idx].value = cache.value[cacheKeys[idx]];
					continue;
				}
				// If it is cacheable and no value exists for it, set that as the cache value for future use
				if (cacheable && typeof cacheKeys[idx] === 'string' && !cache.value[cacheKeys[idx]]) {
					cache.value[cacheKeys[idx]] = result?.data;
				}
				onLoad[idx].value = result?.data;
			}
			return;
		}
		// If onLoad is a function, call it with the responses
		if (typeof onLoad === 'function') {
			return onLoad(Array.isArray(toLoad) ? response : response[0]);
		}
		return;
	});
}
