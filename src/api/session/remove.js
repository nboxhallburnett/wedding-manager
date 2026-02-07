import config from '../../../conf/index.js';

/** @type {API} */
export default {
	method: 'delete',
	path: 'session',
	action: async (req, res) => {
		// Wrap the callback
		// await promisify(req.session.destroy)();
		await new Promise((resolve, reject) => {
			req.session.destroy(err => {
				if (err) {
					return reject(err);
				}
				// Clear the session cookie on successful signout
				res.clearCookie(config.server.session.name);
				resolve();
			});
		});
		// No need to return any data on successful logout
		return res.status(204).send();
	}
};
