const menuItemDb = require('../../lib/db/menu-items');

/** @type {API<InvitationPath} */
module.exports = {
	method: 'delete',
	path: 'menu/:menuItemId',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.session.admin);
	},
	action: async (req, res) => {
		// Validate the record exists
		const item = await menuItemDb.findOne({ id: req.params.menuItemId });
		if (!item) {
			res.status(400);
			throw new Error('"menuItemId" contained an invalid value');
		}

		req.ctx.log('Removing menu item "%s" with ID: %s', item.title, item.id);

		// Remove the record from the collection
		await menuItemDb.deleteOne({ id: item.id });

		// No need to return any data on successful removal
		return res.status(204).send();
	}
};
