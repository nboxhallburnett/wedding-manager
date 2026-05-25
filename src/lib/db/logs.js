import db from './index.js';

/** @type {import('mongodb').Collection<Log>} */
export default db.collection('logs');
