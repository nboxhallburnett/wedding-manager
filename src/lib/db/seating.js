import db from './index.js';

/** @type {import('mongodb').Collection<DiningRoom>} */
export default db.collection('seating');
