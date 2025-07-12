const path = require('path');
const { readFileSync } = require('fs');

const log = require('../lib/logger')('route:index');

let assetManifest;
try {
	assetManifest = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', 'web', 'public', 'manifest.json')));
} catch (err) {
	log('Error reading asset manifest, ensure build is ran before startup. Error: %o', err);
	process.exit(1);
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
	res.set({
		'cache-control': 'no-store, no-cache, must-revalidate',
		expires: 0
	});
	return res.render('index', {
		assetManifest
	});
}
