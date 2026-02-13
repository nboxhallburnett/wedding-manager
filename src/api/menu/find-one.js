import { STATUS_CODES } from 'http';

import menuItemDb from '../../lib/db/menu-items.js';
import { sessionAuth } from '../auth.js';

/** @type {API<MenuItemPath>} */
export default {
	path: 'menu/:menuItemId',
	auth: sessionAuth,
	action: async (req, res) => {
		const item = await menuItemDb.findOne({ id: req.params.menuItemId }, { projection: { _id: 0 } });
		if (!item) {
			res.status(404);
			throw STATUS_CODES[404];
		}
		return res.json({ success: true, data: item });
	}
};
