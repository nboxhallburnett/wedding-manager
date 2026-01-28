const telemetryDb = require('../../lib/db/telemetry');

/** @type {API} */
module.exports = {
	path: 'telemetry',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (req, res) => {
		const projection = { _id: 0 };

		const events = await telemetryDb.find({}, { projection, sort: { created: -1 } }).toArray();
		return res.json({ success: true, data: events });
	}
};
