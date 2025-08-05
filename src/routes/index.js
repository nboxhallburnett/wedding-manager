const path = require('path');
const { readFileSync } = require('fs');

const { nanoid } = require('nanoid');

const config = require('../../conf');
const log = require('../lib/logger')('route:index');

let assetManifest;
let indexJs;
try {
	assetManifest = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', 'web', 'public', 'manifest.json')));
	if (!config.hot) {
		const indexJsFilename = assetManifest['index.js'].split('/js/')[1];
		indexJs = String(readFileSync(path.resolve(__dirname, '..', '..', 'web', 'public', 'js', indexJsFilename)));
	}
} catch (err) {
	log('Error reading asset manifest, ensure build is ran before startup. Error: %o', err);
	process.exit(1);
}

const csp = {
	// Set default rule to self
	'default-src': '\'self\'',
	// Set ourselves as the only allowed base uri
	'base-uri': '\'self\'',
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
	csp['connect-src'] = `'self' http://${config.host}:8468 ws://${config.host}:8468/ws`;
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
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
async function handle(req, res) {
	let nonce = '';
	if (!config.hot) {
		// Generate a 22 char nanoid to give us 132 bits of entropy.
		nonce = nanoid(22).toString('base64');
	}

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

	res.set(headers);

	return res.render('index', {
		assetManifest,
		indexJs: config.hot
			? `<script src="//${config.host}:8468/js/index.js"></script>`
			: `<script nonce="${nonce}">${indexJs.replace('__NONCE__', nonce)}</script>`,
		nonce
	});
}
