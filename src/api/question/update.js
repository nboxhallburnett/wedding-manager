const questionsDb = require('../../lib/db/questions');

/** @type {API<{}, { items: Question[] }>} */
module.exports = {
	method: 'put',
	path: 'question',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.session.admin);
	},
	action: async (req, res) => {
		if (req.body.items
			&& Array.isArray(req.body.items)
			&& !req.body.items.some(item => !item?.title && !item?.answer)
		) {
			req.ctx.log('Updating Q&A content');
			await questionsDb.updateOne({}, { $set: {
				items: req.body.items,
				updated: new Date()
			} }, { upsert: true });
		}

		// No need to return any data on successful update
		return res.status(204).send();
	}
};
