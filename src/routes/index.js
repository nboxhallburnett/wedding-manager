const path = require('path');
const { readFileSync } = require('fs');

const { nanoid } = require('nanoid');

const config = require('../../conf');
const log = require('../lib/logger')('route:index');

let assetManifest;
let indexJs;
try {
	// Load the asset manifest that was output from the webpack build
	assetManifest = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', 'web', 'public', 'manifest.json')));
	if (!config.hot) {
		// When not using the dev server, we'll include the minimal content of the index javascript file
		// with the index html response to allow us to provide webpack with the nonce value to use for its
		// subsequent requests
		const indexJsFilename = assetManifest['index.js'].split('/js/')[1];
		indexJs = String(readFileSync(path.resolve(__dirname, '..', '..', 'web', 'public', 'js', indexJsFilename)));
	}
} catch (err) {
	// If we failed to load the asset manifest, then we won't be able to serve the UI, so fall out
	log('Error reading asset manifest, ensure build is ran before startup. Error: %o', err);
	process.exit(1);
}

// Define base set of CSP headers
const csp = {
	// Set default rule to self
	'default-src': '\'self\'',
	// Set ourselves as the only allowed base uri
	'base-uri': '\'self\'',
	// Set ourselves, data blobs, and google fonts for connect-src.
	// data: is used for the generation of themed qr codes, and google fonts in the sharing of the invitation card
	'connect-src': '\'self\' data: https://fonts.gstatic.com',
	// Allow fonts from ourselves and google fonts
	'font-src': '\'self\' https://fonts.gstatic.com',
	// Don't allow the site to be framed
	'frame-ancestors': '\'none\'',
	'frame-src': '\'none\'',
	// Allow images from ourself and as data blobs (such as .svg loaded as data urls)
	'img-src': '\'self\' data:',
	// Don't allow objects
	'object-src': '\'none\'',
	// Allow styles from ourself and google fonts
	'style-src': '\'self\' https://fonts.googleapis.com'
};

// When using hot reload we'll want to add a few extra options to the base policy
if (config.hot) {
	csp['script-src'] = `'self' 'unsafe-eval' http://${config.host}:8468`;
	csp['connect-src'] += ` http://${config.host}:8468 ws://${config.host}:8468/ws`;
	csp['style-src'] += ` 'unsafe-inline' http://${config.host}:8468`;
} else {
	// Otherwise, add a nonce value to the script and style sources
	csp['script-src'] = '\'nonce-NONCE\'';
	csp['style-src'] += ' \'nonce-NONCE\'';
}

module.exports = {
	handle
};

/**
 * Catch-all html handler to load the front-end assets.
 * No specific route matching is performed here, we rely on the front-end
 * router to handle rendering the expected page.
 *
 * @param {WeddingManagerRequest} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function handle(req, res, next) {
	// If the request does not accept html response, fall out and continue to the generic 404 handler
	if (!req.accepts('html')) {
		return next();
	}

	let nonce = '';
	if (!config.hot) {
		// Generate a 22 char nanoid to give us 132 bits of entropy.
		nonce = nanoid(22).toString('base64');
	}

	// Define the base set of headers
	const headers = {
		'Cache-Control': 'no-store, no-cache, must-revalidate',
		'Content-Security-Policy': Object.entries(csp)
			.map(dir => dir.join(' '))
			.join('; ')
			.replaceAll('NONCE', nonce),
		Expires: 0,
		'X-Content-Type-Options': 'nosniff'
	};

	// Add HSTS and COOP/CORP headers if running on port 443
	if (config.server.external_port === 443) {
		headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload';
		headers['Cross-Origin-Opener-Policy'] = 'same-origin';
		headers['Cross-Origin-Resource-Policy'] = 'same-origin';
	}

	// Set the constructed headers on the response
	res.set(headers);

	// Finally, render the index route with the appropriate javascript content
	return res.render('index', {
		assetManifest,
		indexJs: config.hot
			? `<script src="//${config.host}:8468/js/index.js"></script>`
			: `<script nonce="${nonce}">${indexJs.replace('__NONCE__', nonce)}</script>`,
		nonce
	});
}
