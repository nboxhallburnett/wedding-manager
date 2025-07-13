const { customAlphabet } = require('nanoid');

const rsvpDb = require('../../lib/db/rsvps');

// Use a custom alphabet and size to make the generated identifiers more user friendly.
// This lowers the entropy a fair bit, but should still be acceptible for its use case.
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 10);

/** @type {API<{}, RSVP} */
module.exports = {
	method: 'post',
	path: 'rsvp',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.session.admin);
	},
	action: async (req, res) => {
		/** @type {RSVP} */
		const rsvp = {
			id: nanoid(),
			guests: req.body.guests?.map(guest => ({
				// TODO: Expand with additional fields when they've been defined
				name: String(guest.name || ''),
				status: 0
			}))
		};

		// Ensure at least one guest is defined for the RSVP
		if (!rsvp.guests?.length) {
			res.status(400);
			throw new Error('At least one guest is required for an RSVP');
		}

		// Insert the RSVP record
		await rsvpDb.insertOne(rsvp);

		// No need to return any data on successful creation
		return res.status(204).send();
	}
};
