import db from './index.js';

/** @type {import('mongodb').Collection<FeedbackItem>} */
export default db.collection('feedback');
