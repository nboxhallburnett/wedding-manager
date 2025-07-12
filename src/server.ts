/** RSVP record */
type RSVP = {
	/** RSVP Identifier */
	id: String,
	/** Whether the RSVP holder has elevated access to the system */
	admin?: Boolean
}

type WeddingManagerRequest = import('express').Request & {
	session: import('express-session').Session & {
		/** Authorized RSVP identifier */
		rsvpId?: RSVP['id']
	},
	/** Data contextual to the request */
	ctx: {
		rsvp?: RSVP
	}
}

type API = {
	/** Request path, automatically prefixed with `/api/` */
	path: String,
	/** Request method */
	method: 'get'|'post'|'put'|'delete',
	/** Authentication to satisfy before calling the action */
	auth?: (req: WeddingManagerRequest, res: import('express').Response) => Promise<Boolean|Number>,
	/** Action to be performed when a request is made */
	action: (req: WeddingManagerRequest, res: import('express').Response) => Promise<any>
}
