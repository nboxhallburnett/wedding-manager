const menuItemDb = require('../../lib/db/menu-items');

const propTypes = {
	string: [ 'title', 'description' ],
	boolean: [ 'child', 'vegan', 'vegetarian', 'gluten_free' ],
	number: [ 'course' ]
};

/** @type {API<{}, MenuItem} */
module.exports = {
	method: 'put',
	path: 'menu/:menuItemId',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (req, res) => {
		const existingItem = await menuItemDb.findOne({ id: req.params.menuItemId });

		const update = { $set: {} };

		// Validate the supplied properties are all of the expected types
		for (const [ type, props ] of Object.entries(propTypes)) {
			for (const prop of props) {
				if (Object.prototype.hasOwnProperty.call(req.body, prop)) {
					if (typeof req.body[prop] !== type) {
						res.status(400);
						throw new Error(`"${prop}" must be a ${type}.`);
					}
					update.$set[prop] = req.body[prop];
				}
			}
		}

		// And that the coruse is valid
		if (Object.prototype.hasOwnProperty.call(req.body, 'course')) {
			// And must be a number between 0 and 2
			if (req.body.course < 0 || req.body.course > 2) {
				res.status(400);
				throw new Error(`"course" contained an invalid value: Unknown course value: "${req.body.course}"`);
			}
			update.$set.course = req.body.course;
		}

		// Perform the update if there is anything to modify
		if (Object.keys(update.$set).length) {
			// Set a new updated date
			update.$set.updated = new Date();

			req.ctx.log('Updating menu item "%s" with ID: %s', update.$set.title || existingItem.title, existingItem.id);
			await menuItemDb.updateOne({ id: req.params.menuItemId }, update);
		}

		// No need to return any data on successful update
		return res.status(204).send();
	}
};
