import feedbackDb from '../../lib/db/feedback.js';
import { adminAuth } from '../auth.js';

/**
 * @typedef FeedbackQuery
 * @property {Boolean} [read] Read status of the feedback items to find
 */

/** @type {API<{}, {}, FeedbackQuery>} */
export default {
	path: 'feedback/count',
	auth: adminAuth,
	action: async (req, res) => {
		const filter = {};
		// If the call was made with the `read` query param, add it to the filter
		if (Object.prototype.hasOwnProperty.call(req.query, 'read')) {
			filter.read = String(req.query.read) === 'true';
		}
		// Fetch the count of feedback items with any requested filters
		const data = await feedbackDb.countDocuments(filter);

		return res.json({ success: true, data });
	}
};
