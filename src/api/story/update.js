import storyDb from '../../lib/db/story.js';

/** @type {API<{}, { items: StoryItem[] }>} */
export default {
	method: 'put',
	path: 'story',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (req, res) => {
		if (req.body.items
			&& Array.isArray(req.body.items)
			&& !req.body.items.some(item => !item?.title && !item?.description && !item?.date)
		) {
			req.ctx.log('Updating Story content');
			await storyDb.updateOne({}, { $set: {
				items: req.body.items,
				updated: new Date()
			} }, { upsert: true });
		}

		// No need to return any data on successful update
		return res.status(204).send();
	}
};
