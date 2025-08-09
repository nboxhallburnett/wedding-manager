const db = require('./index');

/** @type {import('mongodb').Collection<Token>} */
module.exports = db.collection('tokens');
