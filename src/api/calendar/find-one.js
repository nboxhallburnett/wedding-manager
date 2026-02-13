import { STATUS_CODES } from 'http';

import calendarEventsDb from '../../lib/db/calendar-events.js';
import { adminAuth } from '../auth.js';

/** @type {API<CalendarEventPath>} */
export default {
	path: 'calendar/:calendarEventId',
	auth: adminAuth,
	action: async (req, res) => {
		const event = await calendarEventsDb.findOne({ id: req.params.calendarEventId }, { projection: { _id: 0 } });
		if (!event) {
			res.status(404);
			throw STATUS_CODES[404];
		}
		return res.json({ success: true, data: event });
	}
};
