import { inject, provide, ref, nextTick, onMounted } from 'vue';

import API from 'lib/api.js';

/** @type {AddToast} */
let addToast;
/** @type {Ref<Boolean>} */
let loading;

/**
 * Composable to handle common submission of forms.
 *
 * @param {Object} options Options for the form to submit
 * @param {String|(U) => String} options.path Path of the API to call. Can either be a string or a function that returns the path
 * @param {'POST'|'PUT'|'DELETE'|((U) => 'POST'|'PUT'|'DELETE')} options.method Method to use when calling the API,
 * @param {T|((U) => T)} [options.body] Body to include in the request
 * @param {Boolean|{ [prop: keyof T]: (T) => Boolean }} [options.validation] Validation to perform before the request is made
 * @param {(data?: Object, response: Response, U) => void} [options.onSuccess] Function to call on successful request
 * @param {(data?: Object, response: Response, U) => void} [options.onError] Function to call on failed request
 * @param {Boolean} [options.loader] Whether to trigger the loading indicator
 *
 * @returns {{ errors: Ref<T>, onSubmit: (U) => void, validate: (prop?: keyof T) => Boolean }}
 */
export function useForm(options) {
	// If the addToast and loading injections aren't already defined, define them
	addToast ||= inject('addToast');
	loading ||= inject('loading');

	/** @type {HTMLFormElement} */
	let $form;

	// Expose reactive object containing, both to the callee
	const errors = ref({});
	// And to the callee's used components
	provide('errors', errors);

	// Also expose the validation function to allow form components to re-trigger the validation themselves on change
	provide('validate', validate);

	// Store a reference to the form container when the page is mounted
	onMounted(() => {
		$form = document.querySelector('form.needs-validation');
		if (options.validation && !$form) {
			console.warn('No valid form found. Ensure one is defined like the following:\n	<form class="needs-validation card-text" novalidate @submit.prevent.stop="onSubmit">');
		}
	});

	/**
	 * Validates the form's data
	 *
	 * @param {keyof T} [prop] Optional specific property to validate
	 * @returns {Boolean} Whether the form is valid
	 */
	function validate(prop) {
		if (!options.body) {
			return true;
		}

		// Turn off any existing 'was-validated' class on the form to reset the state on completion
		$form.classList.remove('was-validated');

		// Loop through the keys that have custom validation defined to perform
		for (const key of prop ? [ prop ] : Object.keys(options.validation || {})) {
			const hasError = options.validation?.[key]?.();
			errors.value[key] = hasError || false;
		}

		// Re-add the was-validated class in the next tick so everything has a change to propagate
		nextTick(() => $form.classList.add('was-validated'));

		// Return whether both the native js validation and our custom validation is happy with the form content
		if (!$form.checkValidity()) {
			return false;
		}
		return !Object.keys(errors.value).length;
	}

	async function onSubmit(...args) {
		// Validate the form before attempting to actually submit it
		if (options.validation && !validate()) {
			const $errors = $form.querySelectorAll(':invalid');
			let $highest;

			// Find which element is highest on the DOM
			$errors.forEach($el => {
				if (!$highest || ($el.offsetHeight && $el.offsetHeight < $highest.offsetHeight)) {
					$highest = $el;
				}
			});

			// If no elements are visible, try to expand any collapsed sections it is in before scrolling to it
			if (!$highest.checkVisibility()) {
				// Fetch the closest non-showing collapsable section to the element in question
				const $collapsedParent = $highest.closest('.collapse:not(.show)');
				if ($collapsedParent) {
					// If one exists, fetch its associated toggle element
					const $collapseToggle = $form.querySelector(`[data-bs-target="#${$collapsedParent.id}"]`);
					if ($collapseToggle) {
						// If that exists, add a one-time listener to the collapsed section for when it is made visible
						$collapsedParent.addEventListener('shown.bs.collapse', () => {
							// And then perform the scroll into view and focus
							$highest.scrollIntoView({ behavior: 'smooth', block: 'center' });
							$highest.focus();
						}, { once: true });

						// And finally trigger the click on the toggle to expand it
						$collapseToggle.click();
					}
				}

				// If the element is already visible, just scroll it into view and focus it
			} else if ($highest) {
				$highest.scrollIntoView({ behavior: 'smooth', block: 'center' });
				$highest.focus();
			}

			// Regardless of being able to scroll the error into view, fall out here to avoid submitting the form
			return;
		}

		if (options.loader !== false) {
			loading.value = true;
		}
		const response = await API(typeof options.path === 'function' ? options.path(...args) : options.path, {
			method: typeof options.method === 'function' ? options.method(...args) : options.method,
			body: typeof options.body === 'function' ? options.body(...args) : options.body
		});
		if (options.loader !== false) {
			loading.value = false;
		}
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
		errors,
		onSubmit,
		validate
	};
}
