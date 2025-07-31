// nonce value is replaced by the index ejs template
__webpack_nonce__ = '__NONCE__';

// Trigger the import our custom CSS
import('../scss/index.scss');

// Load the actual app code in a separate bundle.
import('./app.js').then(app => app.init());
