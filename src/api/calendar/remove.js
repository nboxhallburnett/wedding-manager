const calendarEventsDb = require('../../lib/db/calendar-events');

/** @type {API<CalendarEventPath} */
module.exports = {
	method: 'delete',
	path: 'calendar/:calendarEventId',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.session.admin);
	},
	action: async (req, res) => {
		// Validate the record exists
		const event = await calendarEventsDb.findOne({ id: req.params.calendarEventId });
		if (!event) {
			res.status(400);
			throw new Error('"calendarEventId" contained an invalid value');
		}

		req.ctx.log('Removing event "%s". Event ID: %s', event.summary, event.id);

		// Remove the record from the collection
		await calendarEventsDb.deleteOne({ id: event.id });

		// No need to return any data on successful removal
		return res.status(204).send();
	}
};
