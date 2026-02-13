import questionsDb from '../../lib/db/questions.js';
import { sessionAuth } from '../auth.js';

/** @type {API} */
export default {
	path: 'question',
	auth: sessionAuth,
	action: async (req, res) => {
		const doc = await questionsDb.findOne({}, { projection: { _id: 0 } });
		return res.json({ success: true, data: doc?.items || [] });
	}
};
