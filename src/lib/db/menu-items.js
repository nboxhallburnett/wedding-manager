const db = require('./index');

/** @type {import('mongodb').Collection<MenuItem>} */
module.exports = db.collection('menu-items');
