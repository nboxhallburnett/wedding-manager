import galleryDb from '../../lib/db/gallery.js';

/** @type {API<{}, { items: Image[] }>} */
export default {
	method: 'put',
	path: 'gallery',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (req, res) => {
		if (req.body.items
			&& Array.isArray(req.body.items)
			&& !req.body.items.some(item => !item?.path)
		) {
			req.ctx.log('Updating gallery content');
			await galleryDb.updateOne({}, { $set: {
				items: req.body.items,
				updated: new Date()
			} }, { upsert: true });
		}

		// No need to return any data on successful update
		return res.status(204).send();
	}
};
