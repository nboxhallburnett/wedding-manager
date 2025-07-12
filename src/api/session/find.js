/** @type {API} */
module.exports = {
	method: 'get',
	path: 'session',
	action: async (req, res) => {
		return res.json({ success: true, data: req.session.rsvpId });
	}
};
