import { nanoid } from 'nanoid';

import calendarEventsDb from '../../lib/db/calendar-events.js';

/** @type {API<{}, CalendarEvent} */
export default {
	method: 'post',
	path: 'calendar',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (req, res) => {
		/** @type {CalendarEvent} */
		const event = {
			id: nanoid(),
			allDay: Boolean(req.body.allDay),
			description: String(req.body.description),
			end: new Date(req.body.end),
			location: req.body.location,
			organizer: req.body.organizer,
			start: new Date(req.body.start),
			summary: String(req.body.summary),
			timezone: String(req.body.timezone)
		};

		// TODO: Validate

		req.ctx.log('Creating calendar event "%s". Event ID: %s', event.summary, event.id);

		// Insert the Calendar Event record
		await calendarEventsDb.insertOne(event);

		// No need to return any data on successful creation
		return res.status(204).send();
	}
};
