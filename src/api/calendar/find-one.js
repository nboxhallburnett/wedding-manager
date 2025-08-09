const { STATUS_CODES } = require('http');

const calendarEventsDb = require('../../lib/db/calendar-events');

/** @type {API<CalendarEventPath>} */
module.exports = {
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
