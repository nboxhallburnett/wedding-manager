import { hostname } from 'os';

import logDb from '../../../lib/db/logs.js';
import { adminAuth } from '../../auth.js';

const host = hostname();

/** @type {API} */
export default {
	path: 'admin/logs',
	auth: adminAuth,
	action: async (_req, res) => {
		// Default the query to the currently running host. The service is not intended to be ran multi-process
		// so differing hostnames in a cluster would not be a concern.
		const filter = { host };
		const logs = await logDb.find(filter, { projection: { _id: 0, host: 0 } })
			.sort({ created: -1 })
			.toArray();
		return res.json({ success: true, data: logs });
	}
};
