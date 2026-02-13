import questionsDb from '../../lib/db/questions.js';
import { adminAuth } from '../auth.js';

/** @type {API<{}, { items: Question[] }>} */
export default {
	method: 'put',
	path: 'question',
	auth: adminAuth,
	action: async (req, res) => {
		if (req.body.items
			&& Array.isArray(req.body.items)
			&& !req.body.items.some(item => !item?.title && !item?.answer)
		) {
			req.ctx.log('Updating Q&A content');
			await questionsDb.updateOne({}, { $set: {
				items: req.body.items,
				updated: new Date()
			} }, { upsert: true });
		}

		// No need to return any data on successful update
		return res.status(204).send();
	}
};
