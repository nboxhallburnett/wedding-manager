const db = require('./index');

/** @type {import('mongodb').Collection<{ items: DiningTable[] }>} */
module.exports = db.collection('seating');
