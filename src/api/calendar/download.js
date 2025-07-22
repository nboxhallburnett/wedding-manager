const { default: ical } = require('ical-generator');

const calendarEventsDb = require('../../lib/db/calendar-events');

const pkg = require('../../../package.json');
const config = require('../../../conf');

const calendarData = {
	name: 'Wedding Invitation',
	prodId: {
		company: `${config.groom_short} & ${config.bride_short}`,
		product: pkg.description
	},
	source: `https://${config.host}${config.server.external_port !== 443 ? ':' + config.server.external_port : ''}/api/calendar`
};

/** @type {API} */
module.exports = {
	path: 'calendar.ics',
	// TODO: Auth on calendar, or open to allow source?
	action: async (req, res) => {
		const cal = ical(calendarData);

		// Fetch all events from the db to add
		const events = await calendarEventsDb.find({}, { projection: { _id: 0 } });

		for await (const event of events) {
			cal.createEvent(event);
		}

		res.writeHead(200, {
			'Content-Disposition': 'attachment; filename="calendar.ics"',
			'Content-Type': 'text/calendar; charset=utf-8'
		});

		res.end(cal.toString());
	}
};
