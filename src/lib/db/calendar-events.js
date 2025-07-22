const db = require('./index');

/** @type {import('mongodb').Collection<CalendarEvent>} */
module.exports = db.collection('calendar_events');
