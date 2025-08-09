const feedbackDb = require('../../lib/db/feedback');

/**
 * @typedef FeedbackQuery
 * @property {Boolean} [read] Read status of the feedback items to find
 */

/** @type {API<{}, {}, FeedbackQuery>} */
module.exports = {
	path: 'feedback',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (req, res) => {
		const filter = {};
		// If the call was made with the `read` query param, add it to the filter
		if (Object.prototype.hasOwnProperty.call(req.query, 'read')) {
			filter.read = String(req.query.read) === 'true';
		}
		// Fetch the feedback items
		const data = await feedbackDb
			// With any requested filters
			.find(filter, { projection: { _id: 0 } })
			// Sorted by read status, then by most recently created
			.sort({ read: 1, created: -1 })
			// And finally we'll always want the entire set so get the entire contents of the cursor as an array
			.toArray();

		return res.json({ success: true, data });
	}
};
