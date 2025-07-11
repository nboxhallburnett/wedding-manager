const db = require('../../lib/db');

/** @type {API} */
module.exports = {
	method: 'post',
	path: 'rsvp',
	auth: async req => {
		const rsvp = await db.collection('rsvps').findOne({ id: req.body.rsvpId });
		if (rsvp) {
			req.session.rsvpId = rsvp.id;
			req.session.rsvp = rsvp;
		}

		return Boolean(req.session.rsvp);
	},
	action: async (req, res) => {
		return res.json({ success: true, data: req.session.rsvp });
	}
};
