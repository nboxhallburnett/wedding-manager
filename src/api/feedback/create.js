const { nanoid } = require('nanoid');

const feedbackDb = require('../../lib/db/feedback');

/** @type {API<{}, { message: String }} */
module.exports = {
	method: 'post',
	path: 'feedback',
	auth: async req => {
		// Anyone with a session can send feedback
		return Boolean(req.session.invitationId);
	},
	action: async (req, res) => {
		/** @type {FeedbackItem} */
		const item = {
			id: nanoid(),
			invitation: req.session.invitationId,
			created: new Date(),
			updated: new Date(),
			message: String(req.body.message)
		};

		// Title is required for a menu item
		if (!item.message) {
			res.status(400);
			throw new Error('"message" is a required field.');
		}
		// must be a string
		if (typeof item.message !== 'string') {
			res.status(400);
			throw new Error('"message" must be a string.');
		}
		// And must be <512 characters
		if (item.message.length > 512) {
			res.status(400);
			throw new Error('"message" must be a string.');
		}

		req.ctx.log('Creating feedback item with ID: %s', item.id);

		// Insert the menu item
		await feedbackDb.insertOne(item);

		// No need to return any data on successful creation
		return res.status(204).send();
	}
};
