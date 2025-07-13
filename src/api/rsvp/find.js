const db = require('../../lib/db');

/** @type {API} */
module.exports = {
	path: 'rsvp/query',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.session.admin);
	},
	action: async (req, res) => {
		const rsvpsCursor = await db.collection('rsvps').find();
		const rsvps = await rsvpsCursor.toArray();
		return res.json({ success: true, data: rsvps });
	}
};
