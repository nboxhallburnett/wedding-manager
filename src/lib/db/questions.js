const db = require('./index');

/** @type {import('mongodb').Collection<{ items: Question[] }>} */
module.exports = db.collection('questions');
