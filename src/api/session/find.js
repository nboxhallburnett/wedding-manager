const invitationDb = require('../../lib/db/invitations');

/** @type {API} */
module.exports = {
	method: 'get',
	path: 'session',
	action: async (req, res) => {
		const invitation = req.session.invitationId && await invitationDb.findOne({ id: req.session.invitationId }, { projection: { _id: 0 } });
		return res.json({ success: true, data: invitation });
	}
};
