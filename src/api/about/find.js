import aboutDb from '../../lib/db/about.js';

/** @type {API} */
export default {
	path: 'about',
	auth: async req => {
		// The about content can be fetched by anyone with a session
		return Boolean(req.session.invitationId);
	},
	action: async (req, res) => {
		const data = await aboutDb.findOne({}, { projection: { _id: 0 } });
		return res.json({ success: true, data });
	}
};
