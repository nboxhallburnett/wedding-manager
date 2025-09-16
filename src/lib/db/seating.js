const db = require('./index');

/** @type {import('mongodb').Collection<DiningRoom>} */
module.exports = db.collection('seating');
