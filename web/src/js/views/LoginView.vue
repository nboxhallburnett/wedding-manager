<script setup>
import { inject, ref, useTemplateRef, nextTick, onMounted } from 'vue';
import Router from 'router';

import API from 'lib/api';
import { useForm } from 'composables/form';

/** @type {AddToast} */
const addToast = inject('addToast');
/** @type {Ref<Boolean>} */
const loading = inject('loading');
/** @type {Ref<Invitation>} */
const invitation = inject('invitation');
const invitationId = ref(Router.currentRoute.value.query.id || '');
const showOauth = ref(invitation.value?.pending || null);
const googleSigninButton = useTemplateRef('googleSignin');
const googleSigninButtonWidth = ref('216px');

const { onSubmit } = useForm({
	method: 'POST',
	path: 'session',
	body: { invitationId },
	onSuccess({ data }) {
		// If a regular non-external-admin login, proceed to the application
		if (!data.oauth) {
			invitation.value = data;
			Router.replace(invitation.value.admin
				? { name: 'Admin Overview' }
				: { name: 'Home' }
			);
		}

		// Otherwise, trigger the wire-up of the OAuth sign in flow
		showOauth.value = true;
		nextTick(() => initOauth(invitationId.value, data.state));
	}
});

/**
 * Initialise the OAuth sign in functionality.
 * This includes the loading of the google accounts client script,
 * which is deliberately not included in the base document to reduce
 * page load size.
 *
 * @param {String} email The expected email address from the sign in interaction
 * @param {String} state The state value to pass to the button and to expect in response
 * @returns {void}
 */
function initOauth(email, state) {
	const scriptId = 'google-accounts-client';

	// Only init the Sign in with Google button once
	if (document.getElementById(scriptId)) {
		return renderOauthButton(state);
	}

	// Create a new script element to trigger the load of the script
	const script = document.createElement('script');
	// Give it an ID so we only trigger it once
	script.id = scriptId;
	// Set the source to the expected script location
	script.src = 'https://accounts.google.com/gsi/client';
	// Wire up the initialization and rendering to be done once the script loads
	script.onload = function() {
		// Wire up the OAuth sign in library
		window.google.accounts.id.initialize({
			// Give it the configured client_id
			client_id: CONFIG.oauth.client_id,
			// And establish the authentication callback
			async callback({ credential, state: responseState }) {
				loading.value = true;

				// Ensure the expected state value was returned
				if (responseState !== state) {
					addToast({
						title: 'An Error Occurred',
						body: 'Invalid state returned from OAuth flow. Returning to login page.'
					});
					return logout();
				}

				// Decode the token and ensure the expected email and audience were included
				const decodedToken = decodeJwtResponse(credential);
				if (decodedToken.email !== email) {
					addToast({
						title: 'An Error Occurred',
						body: 'Email address returned from OAuth provider does not match the one entered. Returning to login page.'
					});
					return logout();
				}
				if (decodedToken.aud !== CONFIG.oauth.client_id) {
					addToast({
						title: 'An Error Occurred',
						body: 'Token audience does not match the expected client_id. Returning to login page.'
					});
					return logout();
				}

				// Pass the token and state values to the oauth callback API
				const response = await API('oauth/callback', {
					method: 'POST',
					body: { credential, state }
				});
				if (response.status === 200) {
					showOauth.value = null;
					loading.value = false;
					// Update the invitation in the shared store
					invitation.value = response.result.data;
					// And navigate to the admin overview. The OAuth flow is only used for external admin access.
					Router.replace({ name: 'Admin Overview' });
				} else {
					addToast({
						title: 'An Error Occurred',
						body: 'Error occurred validating OAuth login. Returning to login page.'
					});
					logout();
				}
			}
		});

		renderOauthButton(state);
	};

	// And finally add the script to the document
	document.head.appendChild(script);
}

/**
 * Renders the OAuth sign in button
 *
 * @param {String} state The state value to pass to the OAuth provider
 */
function renderOauthButton(state) {
	// Render the OAuth sign in button
	window.google.accounts.id.renderButton(googleSigninButton.value, {
		type: 'standard',
		size: 'large',
		theme: 'outline',
		text: 'continue_with',
		shape: 'rectangular',
		logo_alignment: 'left',
		width: googleSigninButtonWidth.value,
		state
	});
}

/**
 * Decodes a supplied JWT and returns the parsed payload.
 * Note that this does not validate the signature.
 *
 * @param {String} token JWT to decode
 * @returns {Object}
 */
function decodeJwtResponse(token) {
	const base64Url = token.split('.')[1];
	const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
	}).join(''));

	return JSON.parse(jsonPayload);
}

/**
 * Calls the session logout API and re-renders the login page
 */
async function logout() {
	loading.value = true;
	const response = await API('session', { method: 'DELETE' });
	if (response.status === 204) {
		showOauth.value = null;
		loading.value = false;
	} else {
		// TODO: Handle logout errors
	}
}

// Attempt to focus the input when the page is mounted if requested
const input = useTemplateRef('invitationInput');
onMounted(() => {
	if (showOauth.value) {
		initOauth(invitation.value.id, invitation.value.state);
	} else {
		input.value?.focus();
	}
});
</script>

<template>
	<form class="card-text text-center" @submit.prevent.stop="onSubmit">
		<h4 class="pb-1 text-stroke">
			Manage your RSVP
		</h4>
		<template v-if="!showOauth">
			<p class="text-stroke">
				Enter the ID included on your invitation below.
			</p>
			<div class="form-floating mb-3">
				<input
					id="invitationId"
					ref="invitationInput"
					v-model="invitationId"
					type="text"
					class="form-control"
					placeholder="Invitation ID"
				>
				<label for="invitationId">Invitation ID</label>
			</div>
			<button :disabled="!invitationId" class="btn btn-primary w-100" type="submit">
				Submit
			</button>
		</template>
		<div v-else id="signin-button-container" class="d-inline-block w-100 text-center">
			<div id="signin-placeholder" ref="signin-placeholder" class="d-inline-block placeholder-wave mt-2">
				<div class="placeholder rounded w-100 h-100" />
			</div>
			<div id="google-signin" ref="googleSignin" class="mt-2 d-inline-block" />
			<button class="btn btn-link btn-sm d-block mx-auto text-stroke text-white" @click.prevent.stop="logout">
				Back
			</button>
		</div>
	</form>
</template>

<style lang="scss">
$signin-button-height: 40px;
$signin-button-width: v-bind(googleSigninButtonWidth);

#signin-button-container {
	// Style the loading placeholder to be the same dimensions and position as
	// the button when it has loaded
	#signin-placeholder {
		position: absolute;
		height: $signin-button-height;
		width: $signin-button-width;
		margin-left: calc($signin-button-width * -0.5);
	}

	// Make the signin buttons absolute positioned so it renders over the top
	// of the loading placeholder
	#google-signin {
		position: absolute;
		height: $signin-button-height;
		width: $signin-button-width;
		margin-left: calc($signin-button-width * -0.5);

		// Hide the placeholder sign in buttton that does not render correctly.
		// This element is removed once the iframed button is loaded
		> div > div {
			display: none !important;
		}

		// Fix the OAuth sign in button displaying incorrectly on dark themes
		iframe {
			color-scheme: light;
		}
	}

	.btn-link {
		margin-top: calc($signin-button-height * 1.5);
	}
}
</style>
