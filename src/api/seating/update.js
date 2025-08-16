const seatingDb = require('../../lib/db/seating');

/** @type {API<{}, { items: DiningTable[] }>} */
module.exports = {
	method: 'put',
	path: 'seating',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (req, res) => {
		const items = req.body.items;
		if (!Array.isArray(req.body.items)) {
			res.status(400);
			throw new Error('"items" contained an invalid value: Items must be an array');
		}
		for (const [ idx, table ] of items.entries()) {
			if (!Array.isArray(table)) {
				res.status(400);
				throw new Error(`"items[${idx}]" contained an invalid value: Items content must be an array`);
			}
			for (const [ chairIdx, occupant ] of (table || []).entries()) {
				// Verify the id contains a valid string
				if (Object.prototype.hasOwnProperty.call(occupant, 'id') && typeof occupant.id !== 'string') {
					res.status(400);
					throw new Error(`"items[${idx}][${chairIdx}].id" contained an invalid value: Unsupported value: "${occupant.id}"`);
				}
				// Verify the idx contains a valid number
				if (Object.prototype.hasOwnProperty.call(occupant, 'idx') && typeof occupant.idx !== 'number' || occupant.idx < 0) {
					res.status(400);
					throw new Error(`"items[${idx}][${chairIdx}].idx" contained an invalid value: Unsupported value: "${occupant.idx}"`);
				}
				// Verify 'child' contains a boolean
				if (Object.prototype.hasOwnProperty.call(occupant, 'child') && typeof occupant.child !== 'boolean') {
					res.status(400);
					throw new Error(`"items[${idx}][${chairIdx}].child" contained an invalid value: Unsupported value: "${occupant.child}"`);
				}
			}
		}

		req.ctx.log('Updating seating plan');
		await seatingDb.updateOne({}, { $set: {
			items: req.body.items,
			updated: new Date()
		} }, { upsert: true });

		// No need to return any data on successful update
		return res.status(204).send();
	}
};
