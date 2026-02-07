import invitationDb from '../../lib/db/invitations.js';

/** @type {API} */
export default {
	method: 'get',
	path: 'session',
	action: async (req, res) => {
		// If the session is pending OAuth verification, return just enough data to prompt
		// its wireup, but exclude everything else.
		if (req.session.pending) {
			return res.json({ success: true, data: {
				id: req.session.invitationId,
				state: req.session.state,
				pending: true
			} });
		}
		// Otherwise, return the full invitation record
		const invitation = req.session.invitationId && await invitationDb.findOne({ id: req.session.invitationId }, { projection: { _id: 0 } });
		return res.json({ success: true, data: invitation });
	}
};
