const { customAlphabet } = require('nanoid');

const invitationDb = require('../../lib/db/invitations');

// Use a custom alphabet and size to make the generated identifiers more user friendly.
// This lowers the entropy a fair bit, but should still be acceptible for its use case.
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 10);

/** @type {API<{}, Invitation} */
module.exports = {
	method: 'post',
	path: 'invitation',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.session.admin);
	},
	action: async (req, res) => {
		/** @type {Invitation} */
		const invitation = {
			id: nanoid(),
			created: new Date(),
			guests: req.body.guests?.map(guest => ({
				// TODO: Expand with additional fields when they've been defined
				name: String(guest.name || ''),
				status: 0
			})),
			songs: []
		};

		// Ensure at least one guest is defined for the Invitation
		if (!invitation.guests?.length) {
			res.status(400);
			throw new Error('At least one guest is required for an Invitation');
		}

		req.ctx.log('Creating invitation for "%s" with %d total guests. Invitation ID: %s', invitation.guests[0].name, invitation.guests.length, invitation.id);

		// Insert the Invitation record
		await invitationDb.insertOne(invitation);

		// No need to return any data on successful creation
		return res.status(204).send();
	}
};
