import aboutDb from '../../lib/db/about.js';
import { sessionAuth } from '../auth.js';

/** @type {API} */
export default {
	path: 'about',
	auth: sessionAuth,
	action: async (_req, res) => {
		const data = await aboutDb.findOne({}, { projection: { _id: 0 } });
		return res.json({ success: true, data });
	}
};
