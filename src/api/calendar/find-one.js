import { STATUS_CODES } from 'http';

import calendarEventsDb from '../../lib/db/calendar-events.js';

/** @type {API<CalendarEventPath>} */
export default {
	path: 'calendar/:calendarEventId',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (req, res) => {
		const event = await calendarEventsDb.findOne({ id: req.params.calendarEventId }, { projection: { _id: 0 } });
		if (!event) {
			res.status(404);
			throw STATUS_CODES[404];
		}
		return res.json({ success: true, data: event });
	}
};
