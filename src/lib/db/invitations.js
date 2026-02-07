import db from './index.js';

/** @type {import('mongodb').Collection<Invitation>} */
export default db.collection('invitations');
