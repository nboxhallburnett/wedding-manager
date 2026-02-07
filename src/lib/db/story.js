import db from './index.js';

/** @type {import('mongodb').Collection<{ items: StoryItem[] }>} */
export default db.collection('story');
