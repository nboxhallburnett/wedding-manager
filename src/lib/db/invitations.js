const db = require('./index');

/** @type {import('mongodb').Collection<Invitation>} */
module.exports = db.collection('invitations');
