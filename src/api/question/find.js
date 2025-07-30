const questionsDb = require('../../lib/db/questions');

/** @type {API} */
module.exports = {
	path: 'question',
	auth: async req => {
		// The Q&A content can be fetched by anyone with a session
		return Boolean(req.session.invitationId);
	},
	action: async (req, res) => {
		const doc = await questionsDb.findOne({}, { projection: { _id: 0 } });
		return res.json({ success: true, data: doc?.items || [] });
	}
};
