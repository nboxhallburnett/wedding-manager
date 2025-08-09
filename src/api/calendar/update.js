const { default: ical } = require('ical-generator');

const calendarEventsDb = require('../../lib/db/calendar-events');

const propTypes = {
	string: [ 'summary', 'description', 'timezone' ],
	boolean: [ 'allDay' ]
};

/** @type {API<CalendarEventPath, CalendarEvent>} */
module.exports = {
	method: 'put',
	path: 'calendar/:calendarEventId',
	auth: async req => {
		// Auth success is determined by whether there is a valid admin session
		return Boolean(req.ctx.admin);
	},
	action: async (req, res) => {
		const existingEvent = await calendarEventsDb.findOne({ id: req.params.calendarEventId });

		const update = { $set: {} };

		// Validate the supplied properties are all of the expected types
		for (const [ type, props ] of Object.entries(propTypes)) {
			for (const prop of props) {
				if (Object.prototype.hasOwnProperty.call(req.body, prop)) {
					if (typeof req.body[prop] !== type) {
						res.status(400);
						throw new Error(`"${prop}" must be a ${type}.`);
					}
					update.$set[prop] = req.body[prop];
				}
			}
		}

		for (const prop of [ 'start', 'end' ]) {
			if (req.body[prop]) {
				const date = new Date(req.body[prop]);
				if (isNaN(date.valueOf())) {
					res.status(400);
					throw new Error(`"${prop}" must be a valid Date.`);
				}
			}
		}

		if (Object.prototype.hasOwnProperty.call(req.body, 'organizer')) {
			if (typeof req.body.organizer.name !== 'string') {
				res.status(400);
				throw new Error('"organizer.name" must be a String.');
			}
			if (typeof req.body.organizer.email !== 'string') {
				res.status(400);
				throw new Error('"organizer.email" must be a valid email address.');
			}
			update.$set.organizer = req.body.organizer;
		}

		if (Object.prototype.hasOwnProperty.call(req.body, 'location')) {
			if (typeof req.body.location.title !== 'string') {
				res.status(400);
				throw new Error('"location.title" must be a String.');
			}
			if (Object.prototype.hasOwnProperty.call(req.body.location, 'address')
				&& typeof req.body.location.address !== 'string') {
				res.status(400);
				throw new Error('"location.address" must be a String.');
			}
			if (Object.prototype.hasOwnProperty.call(req.body.location, 'radius')
				&& (typeof req.body.location.radius !== 'number' || req.body.location.radius < 0)) {
				res.status(400);
				throw new Error('"location.radius" must be a positive Number.');
			}
			if (Object.prototype.hasOwnProperty.call(req.body.location, 'geo')) {
				if (typeof req.body.location.geo.lat !== 'number'
					&& (req.body.location.geo.lat < -90 || req.body.location.geo.lat > 90)) {
					res.status(400);
					throw new Error('"location.geo.lat" must be a Number between -90 and 90.');
				}
				if (typeof req.body.location.geo.lon !== 'number'
					&& (req.body.location.geo.lon < -180 || req.body.location.geo.lon > 180)) {
					res.status(400);
					throw new Error('"location.geo.lon" must be a Number between -180 and 180.');
				}
			}
			update.$set.location = req.body.location;
		}

		try {
			const tentativeEvent = Object.assign({}, existingEvent, update.$set);
			const cal = ical();
			cal.createEvent(tentativeEvent);
			cal.toString();
		} catch (err) {
			res.status(400);
			throw err;
		}

		// Perform the update if there is anything to modify
		if (Object.keys(update.$set).length) {
			// Set a new updated date
			update.$set.updated = new Date();

			req.ctx.log('Updating calendar event "%s". Event ID: %s', update.$set.summary || existingEvent.summary, existingEvent.id);
			await calendarEventsDb.updateOne({ id: req.params.calendarEventId }, update);
		}

		// No need to return any data on successful update
		return res.status(204).send();
	}
};
