const db = require('./index');

/** @type {import('mongodb').Collection<{ items: StoryItem[] }>} */
module.exports = db.collection('story');
