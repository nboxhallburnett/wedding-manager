// Import our custom CSS
import '../scss/index.scss';

// Import all of Bootstrap's JS. TODO: Restrict this to only what is actually needed
import 'bootstrap';

import { createApp, ref } from 'vue';

import API from 'lib/api';
import App from 'App.vue';
import Router from 'router';

// Trigger the rsvp fetch before we start to wire up the application
const rsvpFetch = API('rsvp');

// Create base app
const app = createApp(App);

// Define globally provided refs
const rsvp = ref(null);
app.provide('rsvp', rsvp);
// Default the loading indicator while we're performing the initial rsvp lookup
const loading = ref(true);
app.provide('loading', loading);

app.use(Router);

// Render the app on the app container
app.mount('#app');

// Ensure the rsvp fetch resolves before we hide the initial loader
const rsvpResult = await rsvpFetch;
if (rsvpResult.result.data) {
	rsvp.value = rsvpResult.result.data;
	Router.replace({ name: 'Home' });
}
// Mark the loading status as false regardless of whether we found a session or not
loading.value = false;
