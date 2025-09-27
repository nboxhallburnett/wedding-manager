const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client();

const invitationDb = require('../../lib/db/invitations');

const config = require('../../../conf');

/** @type {API<{}, { state: String, credential: String }>} */
module.exports = {
	method: 'post',
	path: 'oauth/callback',
	auth: async req => {
		// If no OAuth client is configured then return forbidden
		if (!config.oauth.client_id) {
			return 403;
		}
		// The OAuth callback API can only be called with a pending session.
		return Boolean(req.session.invitationId && req.session.pending && req.session.state);
	},
	action: async (req, res) => {
		if (req.body.state !== req.session.state) {
			res.status(400);
			throw new Error('"state" contained an invalid value: Value does not match the value in the session record');
		}
		if (!req.body.credential) {
			res.status(400);
			throw new Error('"credential" is a required parameter');
		}
		try {
			// Validate the token using Google's OAuth client
			const ticket = await client.verifyIdToken({
				idToken: req.body.credential,
				audience: config.oauth.client_id
			});

			const payload = ticket.getPayload();
			// Ensure the email matches the pending session, and that it is verified
			if (payload.email !== req.session.invitationId || !payload.email_verified) {
				res.status(400);
				throw new Error('"credential" contained an invalid value: "email" does not match the pending session');
			}
		} catch (err) {
			res.status(400);
			req.ctx.log('Error parsing provided token: %o', err);
			throw new Error('"credential" contained an invalid value');
		}

		// Fetch the invitation record and increment the login count
		const invitation = await invitationDb.findOneAndUpdate({
			id: req.session.invitationId
		}, {
			$inc: { login_count: 1 }
		}, {
			projection: { _id: 0 },
			returnDocument: 'after'
		});

		// Remove the pending values from the session record
		delete req.session.pending;
		delete req.session.state;

		return res.json({ success: true, data: invitation });
	}
};
