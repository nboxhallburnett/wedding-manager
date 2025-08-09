const invitationDb = require('../../lib/db/invitations');
const menuItemDb = require('../../lib/db/menu-items');

const fieldMap = [
	'starter_id',
	'main_id',
	'dessert_id'
];

/** @type {API<InvitationPath} */
module.exports = {
	method: 'delete',
	path: 'menu/:menuItemId',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (req, res) => {
		// Validate the record exists
		const item = await menuItemDb.findOne({ id: req.params.menuItemId });
		if (!item) {
			res.status(400);
			throw new Error('"menuItemId" contained an invalid value');
		}

		req.ctx.log('Removing menu item "%s" with ID: %s', item.title, item.id);

		// If the item is not on the children's menu, then remove it as a selected item from any adult guests
		if (!item.child) {
			await invitationDb.updateMany(
				{ guests: { $exists: true, $ne: [] } },
				{ $set: { [`guests.$[guest].${fieldMap[item.course]}`]: '' } },
				{ arrayFilters: [ { [`guest.${fieldMap[item.course]}`]: item.id } ] }
			);
		}
		// Always remove the item from children that have it selected as they can use either menu
		await invitationDb.updateMany(
			{ children: { $exists: true, $ne: [] } },
			{ $set: { [`children.$[child].${fieldMap[item.course]}`]: '' } },
			{ arrayFilters: [ { [`child.${fieldMap[item.course]}`]: item.id } ] }
		);

		// Remove the record from the collection
		await menuItemDb.deleteOne({ id: item.id });

		// No need to return any data on successful removal
		return res.status(204).send();
	}
};
