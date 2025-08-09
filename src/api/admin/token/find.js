const tokenDb = require('../../../lib/db/tokens');

/** @type {API} */
module.exports = {
	path: 'admin/token',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (req, res) => {
		// Fetch the token records. Contrary to other db items, we are excluding the `id` rather than `_id`.
		// This is because we use the `id` property for the auth requests, and the only time that value
		// is openly exposed is in the response of their initial creation. We'll use the mongo document
		// id as the value for DELETE requests, hence that being the only identifier we expose here.
		const data = await tokenDb.find({}, { projection: { id: 0 } }).toArray();

		return res.json({ success: true, data });
	}
};
