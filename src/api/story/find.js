const storyDb = require('../../lib/db/story');

/** @type {API} */
module.exports = {
	path: 'story',
	auth: async req => {
		// The story content can be fetched by anyone with a session
		return Boolean(req.session.invitationId);
	},
	action: async (req, res) => {
		const doc = await storyDb.findOne({}, { projection: { _id: 0 } });
		return res.json({ success: true, data: doc?.items || [] });
	}
};
