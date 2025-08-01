const galleryDb = require('../../lib/db/gallery');

/** @type {API} */
module.exports = {
	path: 'gallery',
	auth: async req => {
		// The gallery content can be fetched by anyone with a session
		return Boolean(req.session.invitationId);
	},
	action: async (req, res) => {
		const doc = await galleryDb.findOne({}, { projection: { _id: 0 } });
		return res.json({ success: true, data: doc?.items || [] });
	}
};
