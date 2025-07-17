const { STATUS_CODES } = require('http');

const menuItemDb = require('../../lib/db/menu-items');

/** @type {API<MenuItemPath>} */
module.exports = {
	path: 'menu/:menuItemId',
	auth: async req => {
		// An Invitation record can only be fetched by itself or by an admin
		return Boolean(req.params.invitationId === req.session.invitationId || req.session.admin);
	},
	action: async (req, res) => {
		const item = await menuItemDb.findOne({ id: req.params.menuItemId }, { projection: { _id: 0 } });
		if (!item) {
			res.status(404);
			throw STATUS_CODES[404];
		}
		return res.json({ success: true, data: item });
	}
};
