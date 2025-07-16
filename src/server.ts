type WeddingManagerRequest<P={}, B={}, Q=import('qs').ParsedQs> = import('express').Request<P, {}, B, Q> & {
	session: import('express-session').Session & {
		/** Authorized Invitation identifier */
		invitationId?: Invitation['id'],
		/** Whether the session is for an admin */
		admin?: Boolean
	},
	/** Data contextual to the request */
	ctx: {
		invitation?: Invitation,
		/** Logger instance contextual to the request */
		log: import('debug').Debugger
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

type InvitationPath = {
	/** ID of the Invitation of which the request is in context */
	invitationId: Invitation['id']
}
