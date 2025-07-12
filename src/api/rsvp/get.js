const db = require('../../lib/db');

/** @type {API} */
module.exports = {
	path: 'rsvp',
	auth: async req => {
		// Auth success is determined by whether there is a valid session
		return Boolean(req.session.rsvpId);
	},
	action: async (req, res) => {
		const rsvp = await db.collection('rsvps').findOne({ id: req.session.rsvpId });
		return res.json({ success: true, data: rsvp });
	}
};
