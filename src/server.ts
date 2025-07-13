type WeddingManagerRequest<P, B, Q> = import('express').Request<P, {}, B, Q> & {
	session: import('express-session').Session & {
		/** Authorized RSVP identifier */
		rsvpId?: RSVP['id'],
		/** Whether the session is for an admin */
		admin?: Boolean
	},
	/** Data contextual to the request */
	ctx: {
		rsvp?: RSVP
	}
}

type API<P={}, B={}, Q=import('qs').ParsedQs> = {
	/** Request path, automatically prefixed with `/api/` */
	path: String,
	/** Request method */
	method: 'get'|'post'|'put'|'delete',
	/** Authentication to satisfy before calling the action */
	auth?: (req: WeddingManagerRequest<P, B, Q>, res: import('express').Response) => Promise<Boolean|Number>,
	/** Action to be performed when a request is made */
	action: (req: WeddingManagerRequest<P, B, Q>, res: import('express').Response) => Promise<any>
}

type RSVPPath = {
	/** ID of the RSVP of which the request is in context */
	rsvpId: RSVP['id']
}
