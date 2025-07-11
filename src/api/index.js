const { STATUS_CODES } = require('http');
const { join } = require('path');
const { readdir } = require('fs').promises;

const log = require('../lib/logger')('api');

module.exports = {
	init
};

/**
 * Wires up API file definitions to the express app
 *
 * @param {import('express').Application} app
 * @returns {Promise<void>}
 */
async function init(app) {
	for (const file of await readdir(__dirname, { recursive: true })) {
		if (file.endsWith('.js') && !file.endsWith('index.js')) {
			try {
				/** @type {API} */
				const api = require(join(__dirname, file));

				if (typeof api.path === 'string' && typeof api.action === 'function') {
					const method = (api.method || 'get').toLowerCase();
					const path = `/api/${api.path}`;

					// Register the API with the express app
					app[method](path, async (req, res) => {
						try {
							// If the API has auth defined, ensure that is satisfied before calling the action
							if (typeof api.auth === 'function' && !(await api.auth(req, res))) {
								// If it is not satisfied, return a 401
								res.status(401);
								return res.json({ success: false, description: STATUS_CODES[401] });
							}

							// If any auth requirements are met, trigger the action
							await api.action(req, res);

						} catch (err) {
							// If any errors were thrown checking auth or performing the action, return a server error
							log('Error performing request: %o', err);
							res.status(500);
							res.json({ success: false, description: STATUS_CODES[500] });
						}
					});

					log('Registered API: %s %s', method.toUpperCase(), path);
				} else {
					log('Ignoring file: %s', file);
				}
			} catch (err) {
				log('Error loading API %s: %o', file, err);
				process.exit(1);
			}
		}
	}
}
