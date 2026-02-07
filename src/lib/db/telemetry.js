import db from './index.js';

/** @type {import('mongodb').Collection<Telemetry>} */
export default db.collection('telemetry');
