const menuItemDb = require('../../lib/db/menu-items');

/** @type {API} */
module.exports = {
	path: 'menu',
	auth: async req => {
		// The menu can be fetched by anyone with a session
		return Boolean(req.session.invitationId);
	},
	action: async (req, res) => {
		const menuItems = await menuItemDb.find({}, { projection: { _id: 0 } }).toArray();
		return res.json({ success: true, data: menuItems });
	}
};
