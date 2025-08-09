const feedbackDb = require('../../lib/db/feedback');

/** @type {API<FeedbackPath, { read: FeedbackItem['read'] }} */
module.exports = {
	method: 'put',
	path: 'feedback/:feedbackId',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (req, res) => {
		// Validate the record exists
		const existingItem = await feedbackDb.findOne({ id: req.params.feedbackId });
		if (!existingItem) {
			res.status(400);
			throw new Error('"feedbackId" contained an invalid value');
		}

		const update = { $set: {} };

		if (Object.prototype.hasOwnProperty.call(req.body, 'read')) {
			if (typeof req.body.read !== 'boolean') {
				res.status(400);
				throw new Error('"read" must be a boolean.');
			}
			update.$set.read = req.body.read;
		}

		// Perform the update if there is anything to modify
		if (Object.keys(update.$set).length) {
			// Set a new updated date
			update.$set.updated = new Date();

			req.ctx.log('Updating feedback with ID: %s', existingItem.id);
			await feedbackDb.updateOne({ id: req.params.feedbackId }, update);
		}

		// No need to return any data on successful update
		return res.status(204).send();
	}
};
