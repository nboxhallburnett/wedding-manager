const db = require('../../lib/db');

/** @type {API} */
module.exports = {
	method: 'post',
	path: 'rsvp',
	auth: async req => {
		req.session = { rsvp: await db.collection('rsvps').findOne({ id: req.body.rsvpId }) };
		return req.session.rsvp;
	},
	action: async (req, res) => {
		return res.json({ success: true, data: req.session });
	}
};
