const db = require('./index');

/** @type {import('mongodb').Collection<{ content: String }>} */
module.exports = db.collection('about');
