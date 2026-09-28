import storyDb from '#lib/db/story';
import { sessionAuth } from '#api/auth';

/** @type {API} */
export default {
	path: 'story',
	auth: sessionAuth,
	action: async (req, res) => {
		const doc = await storyDb.findOne({}, { projection: { _id: 0 } });
		return res.json({ success: true, data: doc?.items || [] });
	}
};
