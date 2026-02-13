import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { STATUS_CODES } from 'http';

import sharp from 'sharp';

import { sessionAuth } from '../auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const imgCache = {};
const allowedTypes = [ 'avif', 'webp', 'jpeg' ];
const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in seconds

// TODO: Define API param types

/** @type {API} */
export default {
	path: 'gallery/*item_path',
	auth: sessionAuth,
	action: async (req, res) => {
		if (!req.params.item_path?.length || req.params.item_path.includes('..')) {
			res.status(404);
			req.ctx.log('Invalid gallery item path supplied: %o', req.params.item_path);
			throw STATUS_CODES[404];
		}
		const type = req.query.type;
		if (!allowedTypes.includes(type)) {
			res.status(400);
			throw new Error(`"type" contained an invalid value. Allowed values: ${allowedTypes}`);
		}

		const path = req.params.item_path.join('/');
		const filePath = resolve(__dirname, '../../../web/public/', path);

		// If we don't already have a cached copy of the requested file, create one and store it cached in memory
		if (!imgCache[path]?.[type]) {
			// Ensure we have a cache definition for the source file
			imgCache[path] ||= {};
			// Create a buffer from the source file, relatively resized to a max of 768px
			imgCache[path][type] = await sharp(filePath).resize(768)[type]().toBuffer();
		}

		res.setHeader('Cache-Control', `private, max-age=${maxAge}, must-revalidate`);
		res.setHeader('Expires', new Date(Date.now() + maxAge).toUTCString());
		res.setHeader('X-Content-Type-Options', 'nosniff');

		// Send the processed image as the response with the appropriate mime type
		res.type(type);
		res.send(imgCache[path][type]);
	}
};
