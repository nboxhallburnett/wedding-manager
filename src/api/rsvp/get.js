const db = require('../../lib/db');

/** @type {API} */
module.exports = {
	path: 'rsvp',
	action: async (req, res) => {
		const rsvp = req.session.rsvpId && await db.collection('rsvps').findOne({ id: req.session.rsvpId });
		return res.json({ success: true, data: rsvp });
	}
};
