const db = require('./index');

/** @type {import('mongodb').Collection<{ items: Image[] }>} */
module.exports = db.collection('gallery');
