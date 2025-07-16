const { STATUS_CODES } = require('http');

const invitationDb = require('../../lib/db/invitations');

/** @type {API<InvitationPath>} */
module.exports = {
	path: 'invitation/:invitationId',
	auth: async req => {
		// An Invitation record can only be fetched by itself or by an admin
		return Boolean(req.params.invitationId === req.session.invitationId || req.session.admin);
	},
	action: async (req, res) => {
		const invitation = await invitationDb.findOne({ id: req.params.invitationId });
		if (!invitation) {
			res.status(404);
			throw STATUS_CODES[404];
		}
		return res.json({ success: true, data: invitation });
	}
};
