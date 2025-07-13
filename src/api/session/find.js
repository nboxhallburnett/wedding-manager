const rsvpDb = require('../../lib/db/rsvps');

/** @type {API} */
module.exports = {
	method: 'get',
	path: 'session',
	action: async (req, res) => {
		const rsvp = req.session.rsvpId && await rsvpDb.findOne({ id: req.session.rsvpId });
		return res.json({ success: true, data: rsvp });
	}
};
