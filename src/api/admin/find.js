import invitationDb from '../../lib/db/invitations.js';
import { adminAuth } from '../auth.js';

/** @type {API} */
export default {
	path: 'admin',
	auth: adminAuth,
	action: async (_req, res) => {
		const admins = await invitationDb.find({ admin: true }, { projection: { _id: 0 } }).toArray();
		return res.json({ success: true, data: admins });
	}
};
