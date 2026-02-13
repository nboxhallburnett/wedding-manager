import { STATUS_CODES } from 'http';

import invitationDb from '../../lib/db/invitations.js';
import { selfAuth } from '../auth.js';

/** @type {API<InvitationPath>} */
export default {
	path: 'invitation/:invitationId',
	auth: selfAuth,
	action: async (req, res) => {
		const invitation = await invitationDb.findOne({ id: req.params.invitationId }, { projection: { _id: 0 } });
		if (!invitation) {
			res.status(404);
			throw STATUS_CODES[404];
		}
		return res.json({ success: true, data: invitation });
	}
};
