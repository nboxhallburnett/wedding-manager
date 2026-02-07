import db from './index.js';

/** @type {import('mongodb').Collection<Token>} */
export default db.collection('tokens');
