const invitationDb = require('../../../lib/db/invitations');

/** @type {API} */
module.exports = {
	path: 'admin/stats/invitations',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (_req, res) => {
		const [
			ceremonyStatusesCursor,
			receptionStatusesCursor,
			unusedPlusOne,
			childrenCount,
			loginCount,
			songRequestCount,
			messageCount
		] = await Promise.all([
			invitationDb.aggregate([
				{ $project: { _id: 0, 'guests.name': 1, 'guests.status_ceremony': 1 } },
				{ $unwind: '$guests' },
				{ $match: { 'guests.name': { $ne: '' }, 'guests.status_ceremony': { $ne: null } } },
				{ $group: { _id: '$guests.status_ceremony', count: { $sum: 1 } } },
				{ $group: { _id: null, counts: { $push: { k: { $toString: '$_id' }, v: '$count' } } } },
				{ $replaceRoot: { newRoot: { $arrayToObject: '$counts' } } }
			]),
			invitationDb.aggregate([
				{ $project: { _id: 0, 'guests.name': 1, 'guests.status_reception': 1 } },
				{ $unwind: '$guests' },
				{ $match: { 'guests.name': { $ne: '' }, 'guests.status_reception': { $ne: null } } },
				{ $group: { _id: '$guests.status_reception', count: { $sum: 1 } } },
				{ $group: { _id: null, counts: { $push: { k: { $toString: '$_id' }, v: '$count' } } } },
				{ $replaceRoot: { newRoot: { $arrayToObject: '$counts' } } }
			]),
			invitationDb.aggregate([
				{ $project: { _id: 0, 'guests.name': 1 } },
				{ $unwind: '$guests' },
				{ $match: { 'guests.name': '' } },
				{ $group: { _id: null, count: { $sum: 1 } } }
			]).toArray(),
			invitationDb.aggregate([
				{ $project: { _id: 0, 'children.name': 1, 'children.age': 1 } },
				{ $unwind: '$children' },
				{ $match: { 'children.name': { $ne: '' }, 'children.age': { $gt: 0 } } },
				{ $group: { _id: null, count: { $sum: 1 } } }
			]).toArray(),
			invitationDb.aggregate([
				{ $match: { admin: { $ne: true } } },
				{ $project: { _id: 0, 'login_count': 1 } },
				{ $group: { _id: null, count: { $sum: '$login_count' } } }
			]).toArray(),
			invitationDb.aggregate([
				{ $project: { _id: 0, 'songs': 1 } },
				{ $unwind: '$songs' },
				{ $match: { 'songs': { $nin: [ '', null ] } } },
				{ $group: { _id: null, count: { $sum: 1 } } }
			]).toArray(),
			invitationDb.aggregate([
				{ $match: { 'message': { $nin: [ '', null ] } } },
				{ $project: { _id: 0, 'message': 1 } },
				{ $group: { _id: null, count: { $sum: 1 } } }
			]).toArray()
		]);
		// There is only ever one result from each of the status aggregations, so use the first result from the cursor
		const [ statusCeremony, statusReception ] = await Promise.all([
			ceremonyStatusesCursor.next(),
			receptionStatusesCursor.next()
		]);
		// Then close them both
		ceremonyStatusesCursor.close();
		receptionStatusesCursor.close();

		return res.json({ success: true, data: {
			status_ceremony: statusCeremony,
			status_reception: statusReception,
			unused_plus_one: unusedPlusOne[0]?.count || 0,
			total_children: childrenCount[0]?.count || 0,
			total_logins: loginCount[0]?.count || 0,
			total_song_requests: songRequestCount[0]?.count || 0,
			total_messages: messageCount[0]?.count || 0
		} });
	}
};
