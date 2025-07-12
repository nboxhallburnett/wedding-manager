// const { promisify } = require('util');

/** @type {API} */
module.exports = {
	method: 'delete',
	path: 'session',
	action: async (req, res) => {
		// Wrap the callback
		// await promisify(req.session.destroy)();
		await new Promise((resolve, reject) => {
			req.session.destroy(err => err ? reject(err) : resolve());
		});
		// No need to return any data on successful logout
		res.status(204);
		return res.send();
	}
};
