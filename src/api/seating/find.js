const seatingDb = require('../../lib/db/seating');

/** @type {API} */
module.exports = {
	path: 'seating',
	auth: async req => {
		// The seating plan can be fetched by anyone with a session
		return Boolean(req.session.invitationId);
	},
	action: async (req, res) => {
		// TODO: Add query param to enrich the response with seat occupant names.
		// This is what will be used on the guest facing seat plan to mitigate
		// exposing invitation ID values.

		const doc = await seatingDb.findOne({}, { projection: { _id: 0 } });
		// Omit invitation id and idx from the response for non-elevated users.
		if (!req.ctx.admin && doc?.items?.length) {
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
