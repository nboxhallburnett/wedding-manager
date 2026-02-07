import invitationDb from '../../lib/db/invitations.js';

/** @type {API} */
export default {
	path: 'admin',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (_req, res) => {
		const admins = await invitationDb.find({ admin: true }, { projection: { _id: 0 } }).toArray();
		return res.json({ success: true, data: admins });
	}
};
