const { nanoid } = require('nanoid');

const invitationDb = require('../../lib/db/invitations');
const { isPrivateIp } = require('../../lib/admin');

const config = require('../../../conf');

/** @type {API} */
module.exports = {
	method: 'post',
	path: 'session',
	auth: async req => {
		const invitation = await invitationDb.findOne({ id: String(req.body.invitationId).toLowerCase() }, { projection: { _id: 0 } });
		if (invitation) {
			if (invitation.admin) {
				// If the Invitation record includes elevated rights and the request originated from an external network,
				// and either OAuth is disabled or the user is not
				if (!isPrivateIp(req._ip) && (!config.oauth.client_id || !invitation.email)) {
					return 403;

				// If the invitation is for an admin with an associated email address, store the session as pending oauth access
				} else if (config.oauth.client_id && invitation.email) {
					req.session.state = nanoid();
					req.session.pending = true;
				}
			}

			// Otherwise, store the id in the session
			req.session.invitationId = invitation.id;
			// If the invitation grants admin access, store that in the session record
			if (invitation.admin) {
				req.session.admin = true;
			}
			req.ctx.invitation = invitation;
		}

		// Auth success is determined by whether there is a valid Invitation associated with the request
		return Boolean(req.session.invitationId);
	},
	action: async (req, res) => {
		if (req.session.pending) {
			req.ctx.log('Session for "%s" pending oauth confirmation', req.ctx.invitation.id);
			return res.json({ success: true, data: { oauth: true, state: req.session.state } });
		}
		req.ctx.log('Session created for "%s". Invitation ID: %s', req.ctx.invitation.guests?.[0]?.name || req.ctx.invitation.id, req.ctx.invitation.id);
		invitationDb.updateOne({ id: req.ctx.invitation.id }, { $inc: { login_count: 1 } });
		return res.json({ success: true, data: req.ctx?.invitation });
	}
};
