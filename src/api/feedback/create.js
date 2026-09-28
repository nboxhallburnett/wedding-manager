import { nanoid } from 'nanoid';

import feedbackDb from '#lib/db/feedback';
import { sessionAuth } from '#api/auth';

/** @type {API<{}, { message: String }} */
export default {
	method: 'post',
	path: 'feedback',
	auth: sessionAuth,
	action: async (req, res) => {
		// Message is required
		if (!req.body.message) {
			res.status(400);
			throw new Error('"message" is a required field.');
		}
		// must be a string
		if (typeof req.body.message !== 'string') {
			res.status(400);
			throw new Error('"message" must be a string.');
		}
		// And must be <=512 characters
		if (req.body.message.length > 512) {
			res.status(400);
			throw new Error('"message" values must be 512 characters or less.');
		}

		/** @type {FeedbackItem} */
		const item = {
			id: nanoid(),
			invitation: req.session.invitationId,
			created: new Date(),
			updated: new Date(),
			message: req.body.message,
			read: false
		};

		req.ctx.log('Creating feedback item with ID: %s', item.id);

		// Insert the menu item
		await feedbackDb.insertOne(item);

		// No need to return any data on successful creation
		return res.status(204).send();
	}
};
