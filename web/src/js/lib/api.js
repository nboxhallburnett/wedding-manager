import { toRaw, unref, isRef, isReactive, isProxy } from 'vue';

export default API;

/**
 * Performs a request against the application API
 *
 * @param {String} path path relative to the the API. e.g. `'session'`
 * @param {RequestInit} opts
 * @returns {{ status: 204, result: false }|{ status: Number, result: Object }}
 */
async function API (path, opts = {}) {
	// Ensure all requests are made with credentials
	opts.credentials = 'include';
	// And default our payload content type as json
	opts.headers ||= {};
	opts.headers['Content-Type'] ||= 'application/json';
	// Fetch requires serialised bodies regardless of defined content type
	if (typeof opts.body === 'object') {
		opts.body = JSON.stringify(_deepToRaw(opts.body));
	}
	const base = `//${CONFIG.host}${CONFIG.server.external_port !== 443 ? ':' + CONFIG.server.external_port : ''}/api/`;
	const response = await fetch(base + path, opts);
	const data = response.status !== 204 && await response.json();
	return { status: response.status, result: data };
}

/**
 * Recursively converts data from ref/reactive/proxy objects to their raw values.
 * Adapted from: https://github.com/vuejs/core/issues/5303#issuecomment-1543596383
 *
 * @param {any} input Input data to convert
 * @returns {any}
 */
function _deepToRaw(input) {
	if (Array.isArray(input)) {
		return input.map((item) => _deepToRaw(item));
	}
	if (isRef(input)) {
		return _deepToRaw(unref(input));
	}
	if (isReactive(input) || isProxy(input)) {
		return _deepToRaw(toRaw(input));
	}
	if (input && typeof input === 'object') {
		return Object.keys(input).reduce((acc, key) => {
			acc[key] = _deepToRaw(input[key]);
			return acc;
		}, {});
	}
	return input;
}
