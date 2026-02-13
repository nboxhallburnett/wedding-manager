import feedbackDb from '../../lib/db/feedback.js';
import { adminAuth } from '../auth.js';

/** @type {API<FeedbackPath} */
export default {
	method: 'delete',
	path: 'feedback/:feedbackId',
	auth: adminAuth,
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
