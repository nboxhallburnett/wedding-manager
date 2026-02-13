import invitationDb from '../../lib/db/invitations.js';
import { adminAuth } from '../auth.js';

/** @type {API<InvitationPath} */
export default {
	method: 'delete',
	path: 'invitation/:invitationId',
	auth: adminAuth,
	action: async (req, res) => {
		// Validate the record exists
		const invitation = await invitationDb.findOne({ id: req.params.invitationId });
		if (!invitation) {
			res.status(400);
			throw new Error('"invitationId" contained an invalid value');
		}

		req.ctx.log('Removing invitation for "%s" with %d total guests. Invitation ID: %s', invitation.guests?.[0]?.name || invitation.id, invitation.guests?.length, invitation.id);

		// Remove the record from the collection
		await invitationDb.deleteOne({ id: invitation.id });

		// No need to return any data on successful removal
		return res.status(204).send();
	}
};
