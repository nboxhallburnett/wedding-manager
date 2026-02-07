import db from './index.js';

/** @type {import('mongodb').Collection<CalendarEvent>} */
export default db.collection('calendar_events');
