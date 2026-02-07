import db from './index.js';

/** @type {import('mongodb').Collection<MenuItem>} */
export default db.collection('menu_items');
