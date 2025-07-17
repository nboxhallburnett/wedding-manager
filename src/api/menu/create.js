const { nanoid } = require('nanoid');

const menuItemDb = require('../../lib/db/menu-items');

/** @type {API<{}, MenuItem} */
module.exports = {
	method: 'post',
	path: 'menu',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.session.admin);
	},
	action: async (req, res) => {
		/** @type {MenuItem} */
		const item = {
			id: nanoid(),
			created: new Date(),
			updated: new Date(),
			child: Boolean(req.body.child),
			course: req.body.course,
			title: req.body.title,
			description: req.body.description || '',
			vegan: Boolean(req.body.vegan),
			vegetarian: Boolean(req.body.vegan) || Boolean(req.body.vegetarian),
			gluten_free: Boolean(req.body.gluten_free)
		};

		// Title is required for a menu item
		if (!item.title) {
			res.status(400);
			throw new Error('"title" is a required field.');
		}
		// And must be a string
		if (typeof item.title !== 'string') {
			res.status(400);
			throw new Error('"title" must be a string.');
		}

		// Course is required for a menu item
		if (item.course === undefined) {
			res.status(400);
			throw new Error('"course" is a required field.');
		}
		// And must be a number between 0 and 2
		if (item.course < 0 || item.course > 2 || typeof item.course !== 'number') {
			res.status(400);
			throw new Error(`"course" contained an invalid value: Unknown course value: "${item.course}"`);
		}

		// Description must be a string
		if (typeof item.description !== 'string') {
			res.status(400);
			throw new Error('"description" must be a string.');
		}

		req.ctx.log('Creating menu item "%s" with ID: %s', item.title, item.id);

		// Insert the menu item
		await menuItemDb.insertOne(item);

		// No need to return any data on successful creation
		return res.status(204).send();
	}
};
