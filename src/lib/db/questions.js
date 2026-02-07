import db from './index.js';

/** @type {import('mongodb').Collection<{ items: Question[] }>} */
export default db.collection('questions');
