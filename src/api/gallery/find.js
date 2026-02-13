import galleryDb from '../../lib/db/gallery.js';
import { sessionAuth } from '../auth.js';

/** @type {API} */
export default {
	path: 'gallery',
	auth: sessionAuth,
	action: async (req, res) => {
		const doc = await galleryDb.findOne({}, { projection: { _id: 0 } });
		return res.json({ success: true, data: doc?.items || [] });
	}
};
