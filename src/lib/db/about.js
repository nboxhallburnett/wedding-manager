import db from './index.js';

/** @type {import('mongodb').Collection<{ content: String }>} */
export default db.collection('about');
