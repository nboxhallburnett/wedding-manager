/**
 * @type {{ [key: String]: [ import('mongodb').IndexSpecification, import('mongodb').CreateIndexesOptions ][] }}
 */
module.exports = {
	invitations: [
		[ { id: 1 }, { name: 'invitation_id', unique: true } ]
	],
	'menu-items': [
		[ { id: 1 }, { name: 'item_id', unique: true } ]
	],
	sessions: [
		[ { expires: 1 }, { name: 'session_expire', expireAfterSeconds: 0, background: true } ]
	]
};
