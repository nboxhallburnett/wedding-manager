import calendarEventsDb from '#lib/db/calendar-events';
import { adminAuth } from '#api/auth';

/** @type {API} */
export default {
	path: 'calendar',
	auth: adminAuth,
	action: async (req, res) => {
		const events = await calendarEventsDb.find({}, { projection: { _id: 0 } }).toArray();
		return res.json({ success: true, data: events });
	}
};
