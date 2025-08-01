const feedbackDb = require('../../lib/db/feedback');

/** @type {API} */
module.exports = {
	path: 'feedback',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.session.admin);
	},
	action: async (req, res) => {
		const data = await feedbackDb.find({}, { projection: { _id: 0 } }).toArray();
		return res.json({ success: true, data });
	}
};
