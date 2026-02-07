import invitationDb from '../../lib/db/invitations.js';

/**
 * @typedef InvitationQuery
 * @property {String} menuItemId ID of a menu item to find invitations with it selected
 */

/** @type {API<{}, {}, InvitationQuery>} */
export default {
	path: 'invitation',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (req, res) => {
		const filter = { admin: { $ne: true } };
		const projection = { _id: 0 };

		// If a menu item is being queried, query across all item props for guests and children
		if (req.query.menuItemId) {
			filter.$or ||= [];
			filter.$or.push(...[
				{ 'guests.starter_id': req.query.menuItemId },
				{ 'guests.main_id': req.query.menuItemId },
				{ 'guests.dessert_id': req.query.menuItemId },
				{ 'children.starter_id': req.query.menuItemId },
				{ 'children.main_id': req.query.menuItemId },
				{ 'children.dessert_id': req.query.menuItemId }
			]);
			projection.id = 1;
			projection.guests = 1;
			projection.children = 1;
		}

		const invitations = await invitationDb.find(filter, { projection }).toArray();
		return res.json({ success: true, data: invitations });
	}
};
