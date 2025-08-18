const menuItemDb = require('../../lib/db/menu-items');

/**
 * @typedef MenuItemQuery
 * @property {String[]} id IDs of the menu items to find. If supplied, only the id, title, and dietary indications are returned
 */

/** @type {API<{}, {}, MenuItemQuery>} */
module.exports = {
	path: 'menu',
	auth: async req => {
		// The menu can be fetched by anyone with a session
		return Boolean(req.session.invitationId);
	},
	action: async (req, res) => {
		const filter = {};
		const projection = { _id: 0 };

		if (typeof req.query.id === 'string') {
			req.query.id = [ req.query.id ];
		}
		if (Array.isArray(req.query.id)) {
			filter.id = { $in: req.query.id };
			projection.id = 1;
			projection.title = 1;
			projection.vegan = 1;
			projection.vegetarian = 1;
			projection.gluten_free = 1;
		}

		const menuItems = await menuItemDb.find(filter, { projection }).toArray();
		return res.json({ success: true, data: menuItems });
	}
};
