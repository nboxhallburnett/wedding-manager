const invitationDb = require('../../lib/db/invitations');
const { isPrivateIp } = require('../../lib/admin');

/** @type {API} */
module.exports = {
	method: 'post',
	path: 'session',
	auth: async req => {
		const invitation = await invitationDb.findOne({ id: req.body.invitationId });
		if (invitation) {
			// If the Invitation record includes elevated rights and the request originated from an external network, fail auth
			if (invitation.admin && !isPrivateIp(req._ip)) {
				return 403;
			}
			// Otherwise, store the id in the session
			req.session.invitationId = invitation.id;
			if (invitation.admin) {
				req.session.admin = true;
			}
			req.ctx.invitation = invitation;
		}

		// Auth success is determined by whether there is a valid Invitation associated with the request
		return Boolean(req.session.invitationId);
	},
	action: async (req, res) => {
		req.ctx.log('Session created for "%s". Invitation ID: %s', req.ctx.invitation.guests?.[0]?.name, req.ctx.invitation.id);
		return res.json({ success: true, data: req.ctx?.invitation });
	}
};
