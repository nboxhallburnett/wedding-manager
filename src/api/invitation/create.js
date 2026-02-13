import { customAlphabet } from 'nanoid';

import invitationDb from '../../lib/db/invitations.js';
import { adminAuth } from '../auth.js';

// Use a custom alphabet and size to make the generated identifiers more user friendly.
// This lowers the entropy a fair bit, but should still be acceptible for its use case.
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 10);

/** @type {API<{}, Invitation} */
export default {
	method: 'post',
	path: 'invitation',
	auth: adminAuth,
	action: async (req, res) => {
		/** @type {Invitation} */
		const invitation = {
			id: nanoid(),
			created: new Date(),
			updated: new Date(),
			login_count: 0,
			guests: req.body.guests?.map(guest => ({
				name: String(guest.name || ''),
				status_ceremony: 0,
				status_reception: 0,
				starter_id: '',
				main_id: '',
				dessert_id: ''
			})),
			message: '',
			songs: []
		};

		// Ensure at least one guest is defined for the Invitation
		if (!invitation.guests?.length) {
			res.status(400);
			throw new Error('"guests" contained an invalid value: At least one guest is required for an Invitation');
		}

		req.ctx.log('Creating invitation for "%s" with %d total guests. Invitation ID: %s', invitation.guests[0].name, invitation.guests.length, invitation.id);

		// Insert the Invitation record
		await invitationDb.insertOne(invitation);

		// No need to return any data on successful creation
		return res.status(204).send();
	}
};
