import aboutDb from '../../lib/db/about.js';
import { adminAuth } from '../auth.js';

/** @type {API<{}, { content: String }>} */
export default {
	method: 'put',
	path: 'about',
	auth: adminAuth,
	action: async (req, res) => {
		if (req.body.content && typeof req.body.content === 'string') {
			req.ctx.log('Updating about content');
			await aboutDb.updateOne({}, { $set: {
				content: req.body.content,
				updated: new Date()
			} }, { upsert: true });
		}

		// No need to return any data on successful update
		return res.status(204).send();
	}
};
