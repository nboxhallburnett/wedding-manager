const invitationDb = require('../../lib/db/invitations');

/** @type {API<InvitationPath, Invitation>} */
module.exports = {
	method: 'put',
	path: 'invitation/:invitationId',
	auth: async req => {
		// An Invitation record can only be modified by itself or by an admin
		return Boolean(req.params.invitationId === req.session.invitationId || req.session.admin);
	},
	action: async (req, res) => {
		const existingInvitation = await invitationDb.findOne({ id: req.params.invitationId });

		const update = { $set: {} };

		// Validate guest changes
		if (Array.isArray(req.body.guests)) {
			// Ensure non-admin users aren't attempting to modify the guest counts
			if (!req.session.admin && req.body.guests.length !== existingInvitation.guests.length) {
				res.status(400);
				throw new Error('Guest count cannot be modified');
			}

			const guests = [];

			for (const [ idx, guest ] of req.body.guests.entries()) {
				// Set initial "updated" record to the existing value
				const updatedGuest = {};

				if (Object.prototype.hasOwnProperty.call(guest, 'name')) {
					// Verify the status contained a valid value
					if (typeof guest.name !== 'string') {
						res.status(400);
						throw new Error(`"guests[${idx}].name" contained an invalid value: Unsupported value: "${guest.name}"`);
					}

					// Update the verified updated name value
					updatedGuest.name = guest.name;
				}

				if (Object.prototype.hasOwnProperty.call(guest, 'status')) {
					// Verify the status contained a valid value
					if (guest.status < 0 || guest.status > 3 || typeof guest.status !== 'number') {
						res.status(400);
						throw new Error(`"guests[${idx}].status" contained an invalid value: Unknown status value: "${guest.status}"`);
					}

					// Update the verified updated status value
					updatedGuest.status = guest.status;
				}

				guests.push(updatedGuest);
			}

			// If the set of posted guests is valid, mark it as an update candidate
			if (guests.length) {
				update.$set.guests = guests;
			}
		}

		// Validate song changes
		if (req.body.songs) {
			const songs = [];

			for (const [ idx, song ] of req.body.songs.entries()) {
				// Filter out any empty items
				if (!song) {
					continue;
				}
				// Ensure they are strings
				if (typeof song !== 'string') {
					res.status(400);
					throw new Error(`"songs[${idx}]" contained an invalid value: Songs must be strings`);
				}
				// And ensure each item isn't too long
				if (song.length > 100) {
					res.status(400);
					throw new Error(`"songs[${idx}]" contained an invalid value: Song values must be 100 characters or less`);
				}

				songs.push(song);
			}

			if (songs.length > 5) {
				res.status(400);
				throw new Error('"songs" contained an invalid value: Only five song recommendations allowed per invitation');
			}

			update.$set.songs = songs;
		}

		// Perform the update if there is anything to modify
		if (Object.keys(update.$set).length) {
			req.ctx.log('Updating invitation for "%s". Invitation ID: %s', existingInvitation.guests[0].name, existingInvitation.id);
			await invitationDb.updateOne({ id: req.params.invitationId }, update);
		}

		// No need to return any data on successful update
		return res.status(204).send();
	}
};
