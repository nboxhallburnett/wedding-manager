const db = require('./index');

/** @type {import('mongodb').Collection<Telemetry>} */
module.exports = db.collection('telemetry');
