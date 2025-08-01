const feedbackDb = require('../../lib/db/feedback');

/** @type {API<FeedbackPath} */
module.exports = {
	method: 'delete',
	path: 'feedback/:feedbackId',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.session.admin);
	},
	action: async (req, res) => {
		// Validate the record exists
		const item = await feedbackDb.findOne({ id: req.params.feedbackId });
		if (!item) {
			res.status(400);
			throw new Error('"feedbackId" contained an invalid value');
		}

		req.ctx.log('Removing feedback with ID: %s', item.id);

		// Remove the record from the collection
		await feedbackDb.deleteOne({ id: item.id });

		// No need to return any data on successful removal
		return res.status(204).send();
	}
};
