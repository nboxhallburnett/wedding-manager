import calendarEventsDb from '../../lib/db/calendar-events.js';
import { adminAuth } from '../auth.js';

/** @type {API<CalendarEventPath} */
export default {
	method: 'delete',
	path: 'calendar/:calendarEventId',
	auth: adminAuth,
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
