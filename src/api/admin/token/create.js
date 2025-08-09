const { nanoid } = require('nanoid');

const tokenDb = require('../../../lib/db/tokens');

/** @type {API<{}, Token} */
module.exports = {
	method: 'post',
	path: 'admin/token',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (req, res) => {
		/** @type {Token} */
		const token = {
			id: nanoid(42),
			created: new Date(),
			name: req.body.name,
			description: req.body.description || ''
		};

		// Name is required for an auth token
		if (!token.name) {
			res.status(400);
			throw new Error('"name" is a required field.');
		}
		// and must be a string
		if (typeof token.name !== 'string') {
			res.status(400);
			throw new Error('"name" must be a string.');
		}

		// If a description was provided, ensure it is a string
		if (token.description && typeof token.description !== 'string') {
			res.status(400);
			throw new Error('"description" must be a string.');
		}

		req.ctx.log('Creating authentication token "%s"', token.name);

		// Insert the Token record
		await tokenDb.insertOne(token);

		// No need to return any data on successful creation
		return res.json({ success: true, data: token });
	}
};
