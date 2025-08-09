const aboutDb = require('../../lib/db/about');

/** @type {API<{}, { content: String }>} */
module.exports = {
	method: 'put',
	path: 'about',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (req, res) => {

		if (req.body.content && typeof req.body.content === 'string') {
			req.ctx.log('Updating about content');
			await aboutDb.updateOne({}, { $set: {
				content: req.body.content,
				updated: new Date()
			} }, { upsert: true });
		}

		// No need to return any data on successful update
		return res.status(204).send();
	}
};
