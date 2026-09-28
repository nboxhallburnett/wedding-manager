import telemetryDb from '#lib/db/telemetry';
import { adminAuth } from '#api/auth';

/** @type {API} */
export default {
	path: 'telemetry',
	auth: adminAuth,
	action: async (req, res) => {
		const projection = { _id: 0 };

		const events = await telemetryDb.find({}, { projection, sort: { created: -1 } }).toArray();
		return res.json({ success: true, data: events });
	}
};
