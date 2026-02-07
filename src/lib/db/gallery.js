import db from './index.js';

/** @type {import('mongodb').Collection<{ items: Image[] }>} */
export default db.collection('gallery');
