const path = require('path');
const { readFileSync } = require('fs');

const config = require('../../conf');
const log = require('../lib/logger')('route:index');

let assetManifest;
try {
	assetManifest = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', 'web', 'public', 'manifest.json')));
} catch (err) {
	log('Error reading asset manifest, ensure build is ran before startup. Error: %o', err);
	process.exit(1);
}

const csp = {
	// Set default rule to self
	'default-src': '\'self\'',
	// Allow fonts from ourselves and google fonts
	'font-src': '\'self\' https://fonts.gstatic.com',
	// Don't allow the site to be framed
	'frame-ancestors': '\'none\'',
	'frame-src': '\'none\'',
	// Allow images from ourself and as data blobs (such as .svg loaded as data urls)
	'img-src': '\'self\' data:',
	// Don't allow objects
	'object-src': '\'none\'',
	// Allow styles from ourself and from google fonts
	'style-src': '\'self\' https://fonts.googleapis.com'
};

// When using hot reload we'll want to add a few extra options to the base policy
if (config.hot) {
	csp['script-src'] = `'self' 'unsafe-eval' http://${config.host}:8468`;
	csp['connect-src'] = `'self' http://${config.host}:8468 ws://${config.host}:8468/ws`;
	csp['style-src'] += ` 'unsafe-inline' http://${config.host}:8468`;
}

module.exports = {
	handle
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
async function handle(req, res) {
	const headers = {
		'Cache-Control': 'no-store, no-cache, must-revalidate',
		'Content-Security-Policy': Object.entries(csp)
			.map(dir => dir.join(' '))
			.join('; '),
		'Expires': 0,
		'X-Content-Type-Options': 'nosniff'
	};

	// Add HSTS and COOP/CORP headers if running on port 443
	if (config.server.external_port === 443) {
		headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload';
		headers['Cross-Origin-Opener-Policy'] = 'same-origin';
		headers['Cross-Origin-Resource-Policy'] = 'same-origin';
	}

	res.set(headers);

	return res.render('index', {
		assetManifest
	});
}
