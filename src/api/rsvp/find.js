const rsvpDb = require('../../lib/db/rsvps');

/** @type {API} */
module.exports = {
	path: 'rsvp',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.session.admin);
	},
	action: async (req, res) => {
		// TODO: Support supplying sanitized query to db lookup
		const rsvpsCursor = await rsvpDb.find();
		const rsvps = await rsvpsCursor.toArray();
		return res.json({ success: true, data: rsvps });
	}
};
