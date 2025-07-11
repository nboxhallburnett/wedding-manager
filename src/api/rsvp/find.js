/** @type {API} */
module.exports = {
	path: 'rsvp',
	auth: async req => {
		return true;
	},
	action: async (_req, res) => {
		return res.json({ success: true, data: { path: 'rsvp' } });
	}
};
