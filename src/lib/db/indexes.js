/**
 * @type {{ [key: String]: [ import('mongodb').IndexSpecification, import('mongodb').CreateIndexesOptions ][] }}
 */
module.exports = {
	calendar_events: [
		[ { id: 1 }, { name: 'event_id', unique: true } ]
	],
	feedback: [
		[ { id: 1 }, { name: 'feedback_id', unique: true } ],
		[ { read: 1 }, { name: 'feedback_read', background: true } ],
		[ { read: 1, created: -1 }, { name: 'feedback_search_order' } ]
	],
	invitations: [
		[ { id: 1 }, { name: 'invitation_id', unique: true } ],
		[ { admin: 1 }, { name: 'is_admin' } ]
	],
	menu_items: [
		[ { id: 1 }, { name: 'item_id', unique: true } ]
	],
	sessions: [
		[ { expires: 1 }, { name: 'session_expire', expireAfterSeconds: 0, background: true } ]
	],
	tokens: [
		[ { id: 1 }, { name: 'token_id', unique: true } ]
	]
};
