const invitationDb = require('../../lib/db/invitations');

// An extremely basic email regex.
const reEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** @type {API<{}, { id: String, email: Boolean }} */
module.exports = {
	method: 'post',
	path: 'admin',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (req, res) => {
		/** @type {Invitation} */
		const invitation = {
			id: req.body.id,
			email: Boolean(req.body.email),
			admin: true,
			created: new Date(),
			login_count: 0
		};

		// Ensure the invitation ID is a valid string
		if (!invitation.id || typeof invitation.id !== 'string') {
			res.status(400);
			throw new Error('"id" contained an invalid value: "id" must be a string');
		}

		// Ensure the ID is stored lowercase
		invitation.id = invitation.id.toLowerCase();

		// Set email value if supplied
		if (Boolean(req.body.email) === true) {
			// But verify the id is a valid email address
			if (!reEmail.test(invitation.id)) {
				res.status(400);
				throw new Error('"id" contained an invalid value: "id" must be an email address with "email" enabled');
			}
			invitation.email = true;
		}

		req.ctx.log('Creating admin user "%s"', invitation.id);

		// Insert the Invitation record
		await invitationDb.insertOne(invitation);

		// No need to return any data on successful creation
		return res.status(204).send();
	}
};
