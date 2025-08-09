const invitationDb = require('../../../lib/db/invitations');

/** @type {API} */
module.exports = {
	path: 'admin/stats/menu',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (_req, res) => {
		const [ adultCursor, childCursor ] = await Promise.all([
			invitationDb.aggregate([
				// For adult meal stats, we only care about the contents of the guests array
				{ $project: { _id: 0, guests: 1 } },
				// Split each guest into its own item in the aggregation
				{ $unwind: '$guests' },
				// We only care about guests who are confirmed or tentative for the reception
				{ $match: { 'guests.status_reception': { $in: [ 1, 2 ] } } },
				// Merge the values of the three meal items into a single collection of meal IDs
				{ $addFields: { meal: [ '$guests.starter_id', '$guests.main_id', '$guests.dessert_id' ] } },
				// And split each guests meal into its own item in the aggregation
				{ $unwind: '$meal' },
				{ $match: { meal: { $ne: null } } },
				// So we can group by the individual IDs, keeping track of the total number of occurrences
				{ $group: { _id: '$meal', count: { $sum: 1 } } },
				// Now we can construct a new key/value structure for the data
				{ $group: { _id: null, counts: { $push: { k: '$_id', v: '$count' } } } },
				// To flatten the resulting data into an object keyed by the item IDs with their values being how many guests have picked it
				{ $replaceRoot: { newRoot: { $arrayToObject: '$counts' } } }
			]),
			invitationDb.aggregate([
				// Repeat the above aggregation, but replacing guests with children
				{ $project: { _id: 0, children: 1 } },
				{ $unwind: '$children' },
				// And instead of validating their attendance, validate their ages.
				{ $match: { 'children.age': { $gt: 2 } } },
				// TODO: Make grouping splitting children < 8, < 12, >=12
				{ $addFields: { meal: [ '$children.starter_id', '$children.main_id', '$children.dessert_id' ] } },
				{ $unwind: '$meal' },
				{ $match: { meal: { $ne: null } } },
				{ $group: { _id: '$meal', count: { $sum: 1 } } },
				{ $group: { _id: null, counts: { $push: { k: '$_id', v: '$count' } } } },
				{ $replaceRoot: { newRoot: { $arrayToObject: '$counts' } } }
			])
		]);
		// There is only ever one result from each aggregation, so use the first result from the cursor
		const [ adult, child ] = await Promise.all([
			adultCursor.next(),
			childCursor.next()
		]);
		// Then close them both
		adultCursor.close();
		childCursor.close();

		return res.json({ success: true, data: { adult, child } });
	}
};
