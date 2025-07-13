const { STATUS_CODES } = require('http');

const rsvpDb = require('../../lib/db/rsvps');

/** @type {API<RSVPPath>} */
module.exports = {
	path: 'rsvp/:rsvpId',
	auth: async req => {
		// An RSVP record can only be fetched by itself or by an admin
		return Boolean(req.params.rsvpId === req.session.rsvpId || req.session.admin);
	},
	action: async (req, res) => {
		const rsvp = await rsvpDb.findOne({ id: req.params.rsvpId });
		if (!rsvp) {
			res.status(404);
			throw STATUS_CODES[404];
		}
		return res.json({ success: true, data: rsvp });
	}
};
