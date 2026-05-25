/**
 * @type {{ [key: String]: [ import('mongodb').IndexSpecification, import('mongodb').CreateIndexesOptions ][] }}
 */
export default {
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
	logs: [
		[ { host: 1 }, { name: 'log_host' } ],
		[ { created: -1 }, { name: 'log_created_sort' } ],
		[ { created: 1 }, { name: 'log_retention', expireAfterSeconds: (60 * 60 * 24 * 90) } ] // Delete log records after 90 days
	],
	menu_items: [
		[ { id: 1 }, { name: 'item_id', unique: true } ],
		[ { child: 1, course: 1 }, { name: 'item_sort' } ]
	],
	sessions: [
		[ { expires: 1 }, { name: 'session_expire', expireAfterSeconds: 0, background: true } ]
	],
	telemetry: [
		[ { id: 1 }, { name: 'telemetry_id', unique: true } ]
	],
	tokens: [
		[ { id: 1 }, { name: 'token_id', unique: true } ]
	]
};
