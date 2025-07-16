const invitationDb = require('../../lib/db/invitations');

/** @type {API} */
module.exports = {
	path: 'invitation',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.session.admin);
	},
	action: async (req, res) => {
		// TODO: Support supplying sanitized query to db lookup
		const invitationsCursor = await invitationDb.find({}, { projection: { _id: 0 } });
		const invitations = await invitationsCursor.toArray();
		return res.json({ success: true, data: invitations });
	}
};
