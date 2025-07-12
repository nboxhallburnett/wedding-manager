const db = require('../../lib/db');
const { isPrivateIp } = require('../../lib/admin');

/** @type {API} */
module.exports = {
	method: 'post',
	path: 'rsvp',
	auth: async req => {
		const rsvp = await db.collection('rsvps').findOne({ id: req.body.rsvpId });
		if (rsvp) {
			// If the RSVP record includes elevated rights and the request originated from an external network, fail auth
			if (rsvp.admin && !isPrivateIp(req._ip)) {
				return 403;
			}
			// Otherwise, store the id in the session
			req.session.rsvpId = rsvp.id;
			req.ctx.rsvp = rsvp;
		}

		// Auth success is determined by whether there is a valid RSVP associated with the request
		return Boolean(req.session.rsvpId);
	},
	action: async (req, res) => {
		return res.json({ success: true, data: req.ctx?.rsvp });
	}
};
