import { STATUS_CODES } from 'http';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readdir } from 'fs/promises';

import Logger from '../lib/logger.js';
const log = Logger('api');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Wires up API file definitions to the express app
 *
 * @param {import('express').Application} app
 * @returns {Promise<void>}
 */
export async function init(app) {
	app.use('/api/*splat', (req, res, next) => {
		// Add cache control headers to API responses
		res.set({
			'Cache-Control': 'no-store, no-cache, must-revalidate',
			Expires: 0
		});
		next();
	});

	// Recursively loop through all files inside the api directory
	for (const file of await readdir(__dirname, { recursive: true })) {
		// If the file is a non-index javascript file, treat it as if it is an API definition and attempt to load it
		if (file.endsWith('.js') && !file.endsWith('index.js')) {
			try {
				/** @type {API} */
				const { default: api = {} } = await import(join(__dirname, file));

				// If it has the expected exports of an API definition, wire it up
				if (typeof api.path === 'string' && typeof api.action === 'function') {
					const method = (api.method || 'get').toLowerCase();
					const path = `/api/${api.path}`;

					// Register the API with the express app
					app[method](path, async (req, res) => {
						try {
							// If the API has auth defined, ensure that is satisfied before calling the action
							const authResult = typeof api.auth !== 'function' || await api.auth(req, res);
							if (authResult === false || typeof authResult === 'number') {
								// If it is not satisfied, return the code returned from the check or 401
								res.status(authResult || 401);
								return res.json({ success: false, description: STATUS_CODES[authResult || 401] });
							}

							// If any auth requirements are met, trigger the action
							await api.action(req, res);
						} catch (err) {
							// Log any errors thrown during the request
							if (res.statusCode === 200) {
								log('Error performing request: %o', err);
								res.status(500);
							} else {
								// If a status code was already set, it was a handled error so we can just log the
								// message for our own records. No need to include the full stack.
								log('Error performing request: %s', String(err));
							}
							res.json({
								success: false,
								description: res.statusCode === 500
									? STATUS_CODES[500]
									: String(err)
							});
						}
					});

					log('Registered API: %s %s', method.toUpperCase(), path);
					if (!Object.prototype.hasOwnProperty.call(api, 'auth')) {
						log('  WARN: No auth defined');
					}
				} else {
					log('Ignoring file: %s', file);
				}
			} catch (err) {
				log('Error loading API %s: %o', file, err);
				process.exit(1);
			}
		}
	}

	// Return 404 for any other requests against the api path
	app.use('/api/*splat', (req, res) => {
		res.status(404);
		res.json({ success: false, description: STATUS_CODES[404] });
	});
}
