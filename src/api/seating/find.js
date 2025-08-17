const seatingDb = require('../../lib/db/seating');
const invitationDb = require('../../lib/db/invitations');

/** @type {API} */
module.exports = {
	path: 'seating',
	auth: async req => {
		// The seating plan can be fetched by anyone with a session
		return Boolean(req.session.invitationId);
	},
	action: async (req, res) => {
		const guestMap = {};
		// If the request is for the enriched seating plan, fetch all invitations so
		// we can source table occupant names
		if (String(req.query.enrich) === 'true') {
			// We never want to include admin users in the set
			const filter = { admin: { $ne: true } };
			// And we only care about the invitation id and the names of guests and children
			const projection = { _id: 0, id: 1, 'guests.name': 1, 'children.name': 1 };
			// Include menu options for admin users
			if (req.ctx.admin) {
				for (const type of [ 'guests', 'children' ]) {
					projection[`${type}.starter_id`] = 1;
					projection[`${type}.main_id`] = 1;
					projection[`${type}.dessert_id`] = 1;
				}
			}
			const invitationsCursor = await invitationDb.find(filter, { projection });
			// Loop over the returned cursor and create a map of invitations by their ID for easy reference later
			for await (const invitation of invitationsCursor) {
				guestMap[invitation.id] = invitation;
			}
			// And now we can close the cursor
			invitationsCursor.close();
		}

		// Fetch the seating plan record
		const doc = await seatingDb.findOne({}, { projection: { _id: 0 } });

		if (String(req.query.enrich) === 'true') {
			// If we're enriching the response, loop over each table
			for (const table of doc.items) {
				// And each set of that table
				for (const seat of table) {
					// And add the occupants name from the associated record of the stored invitation ID
					seat.name = guestMap[seat.id]?.[seat.child ? 'children' : 'guests']?.[seat.idx]?.name;
					if (req.ctx.admin) {
						seat.starter_id = guestMap[seat.id]?.[seat.child ? 'children' : 'guests']?.[seat.idx]?.starter_id;
						seat.main_id = guestMap[seat.id]?.[seat.child ? 'children' : 'guests']?.[seat.idx]?.main_id;
						seat.dessert_id = guestMap[seat.id]?.[seat.child ? 'children' : 'guests']?.[seat.idx]?.dessert_id;
					}
					// We no longer need the invitation ID or index in the record, so remove that now
					delete seat.id;
					delete seat.idx;
				}
			}
		}

		// Omit invitation id and idx from the response for non-elevated users.
		// No need to do it for enriched queries either as it is already sanitized above
		if (!req.ctx.admin && doc?.items?.length && !req.query.enrich) {
			for (const table of doc.items) {
				for (const seat of table) {
					delete seat.id;
					delete seat.idx;
				}
			}
		}
		return res.json({ success: true, data: doc?.items || [] });
	}
};
