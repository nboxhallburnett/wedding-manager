const db = require('./index');

/** @type {import('mongodb').Collection<FeedbackItem>} */
module.exports = db.collection('feedback');
