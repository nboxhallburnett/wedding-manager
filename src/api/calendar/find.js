import calendarEventsDb from '../../lib/db/calendar-events.js';

/** @type {API} */
export default {
	path: 'calendar',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	// TODO: Auth on calendar, or open to allow source?
	action: async (req, res) => {
		const events = await calendarEventsDb.find({}, { projection: { _id: 0 } }).toArray();
		return res.json({ success: true, data: events });
	}
};
