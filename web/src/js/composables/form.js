import { inject } from 'vue';

import API from 'lib/api';

/** @type {AddToast} */
let addToast;
/** @type {Ref<Boolean>} */
let loading;

/**
 * Composable to handle common submission of forms.
 *
 * @param {Object} options Options for the form to submit
 * @param {String|(T) => String} options.path Path of the API to call. Can either be a string or a function that returns the path
 * @param {'POST'|'PUT'|'DELETE'|((T) => 'POST'|'PUT'|'DELETE')} options.method Method to use when calling the API,
 * @param {Ref|((T) => Ref|Object)} [options.body] Body to include in the request
 * @param {(data?: Object, response: Response, T) => void} [options.onSuccess] Function to call on successful request
 * @param {(data?: Object, response: Response, T) => void} [options.onError] Function to call on failed request
 *
 * @returns {{ onSubmit: (T) => void }}
 */
export function useForm(options) {
	// If the addToast and loading injections aren't already defined, define them
	addToast ||= inject('addToast');
	loading ||= inject('loading');

	async function onSubmit(...args) {
		loading.value = true;
		const response = await API(typeof options.path === 'function' ? options.path(...args) : options.path, {
			method: typeof options.method === 'function' ? options.method(...args) : options.method,
			body: typeof options.body === 'function' ? options.body(...args) : options.body
		});
		loading.value = false;
		// If a successful response was returned, trigger any onSuccess handler and return
		if (response.status >= 200 && response.status <= 299) {
			if (options.onSuccess) {
				options.onSuccess(response.result, response, ...args);
			}
			return;
		}
		// Otherwise, trigger any onError handler
		if (options.onError) {
			return options.onError(response.result, response, ...args);
		}
		// Falling back to creating a generic error toast
		addToast({
			title: 'An Error Occurred',
			body: response.result.description
		});
	}

	return {
		onSubmit
	};
}
