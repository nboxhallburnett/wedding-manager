const menuItemDb = require('../../lib/db/menu-items');

/** @type {API} */
module.exports = {
	path: 'menu',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.session.admin);
	},
	action: async (req, res) => {
		// TODO: Support supplying sanitized query to db lookup
		const menuItems = await menuItemDb.find({}, { projection: { _id: 0 } }).toArray();
		return res.json({ success: true, data: menuItems });
	}
};
