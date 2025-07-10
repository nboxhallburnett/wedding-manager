// Import our custom CSS
import '../scss/index.scss';

// Import all of Bootstrap's JS. TODO: Restrict this to only what is actually needed
import 'bootstrap';

import { createApp, ref } from 'vue';

import App from './App.vue';
import router from './router';

// Create base app
const app = createApp(App);

const loading = ref(false);
app.provide('loading', loading);
app.provide('setLoading', value => loading.value = value);

app.use(router);

// Render the app on the app container
app.mount('#app');
