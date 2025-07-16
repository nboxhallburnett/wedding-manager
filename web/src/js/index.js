// Import our custom CSS
import '../scss/index.scss';

// Import all of Bootstrap's JS. TODO: Restrict this to only what is actually needed
import 'bootstrap';

import { createApp, ref } from 'vue';

import API from 'lib/api';
import App from 'App.vue';
import Router from 'router';

// Trigger the session fetch before we start to wire up the application
const sessionFetch = API('session');

// Create base app
const app = createApp(App);

// Define globally provided refs
const invitation = ref(null);
app.provide('invitation', invitation);
const loading = ref(false);
app.provide('loading', loading);

// Ensure the invitation fetch resolves before we mount the application
const invitationResult = await sessionFetch;
if (invitationResult.result.data) {
	invitation.value = invitationResult.result.data;
}

// Wire up the router after we've fetched the invitation to ensure routes have
// accurate session context before router guards are processed
app.use(Router);

// Render the app on the app container
app.mount('#app');
