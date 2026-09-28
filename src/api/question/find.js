import questionsDb from '#lib/db/questions';
import { sessionAuth } from '#api/auth';

/** @type {API} */
export default {
	path: 'question',
	auth: sessionAuth,
	action: async (req, res) => {
		const data = await questionsDb.findOne({}, { projection: { _id: 0 } });
		return res.json({ success: true, data });
	}
};
