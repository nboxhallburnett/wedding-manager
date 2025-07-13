const db = require('./index');

/** @type {import('mongodb').Collection<RSVP>} */
module.exports = db.collection('rsvps');
