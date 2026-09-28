import aboutDb from '#lib/db/about';
import { sessionAuth } from '#api/auth';

/** @type {API} */
export default {
	path: 'about',
	auth: sessionAuth,
	action: async (_req, res) => {
		const data = await aboutDb.findOne({}, { projection: { _id: 0 } });
		return res.json({ success: true, data });
	}
};
