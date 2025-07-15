const rsvpDb = require('../../lib/db/rsvps');

/** @type {API<RSVPPath, RSVP>} */
module.exports = {
	method: 'put',
	path: 'rsvp/:rsvpId',
	auth: async req => {
		// An RSVP record can only be modified by itself or by an admin
		return Boolean(req.params.rsvpId === req.session.rsvpId || req.session.admin);
	},
	action: async (req, res) => {
		const existingRSVP = await rsvpDb.findOne({ id: req.params.rsvpId });

		const update = { $set: {} };

		// Validate guest changes
		if (Array.isArray(req.body.guests)) {
			// Ensure non-admin users aren't attempting to modify the guest counts
			if (!req.session.admin && req.body.guests.length !== existingRSVP.guests.length) {
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
					// Verify the status wasn't reset back to Pending (0)
					if (guest.status === 0 && !req.session.admin) {
						res.status(400);
						throw new Error(`"guests[${idx}].status" contained an invalid value: Cannot set status to Pending (0).`);
					}
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

		// Perform the update if there is anything to modify
		if (Object.keys(update.$set).length) {
			await rsvpDb.updateOne({ id: req.params.rsvpId }, update);
		}

		// No need to return any data on successful update
		return res.status(204).send();
	}
};
