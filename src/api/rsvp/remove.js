const rsvpDb = require('../../lib/db/rsvps');

/** @type {API<RSVPPath} */
module.exports = {
	method: 'delete',
	path: 'rsvp/:rsvpId',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.session.admin);
	},
	action: async (req, res) => {
		// Validate the record exists
		const rsvp = await rsvpDb.findOne({ id: req.params.rsvpId });
		if (!rsvp) {
			res.status(400);
			throw new Error('rsvpId contanied an invalid value');
		}

		// Remove the record from the collection
		await rsvpDb.deleteOne({ id: rsvp.id });

		// No need to return any data on successful removal
		return res.status(204).send();
	}
};
