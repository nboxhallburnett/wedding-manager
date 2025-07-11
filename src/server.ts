type API = {
	/** Request path, automatically prefixed with `/api/` */
	path: String,
	/** Request method */
	method: 'get'|'post'|'put'|'delete',
	/** Authentication to satisfy before calling the action */
	auth?: (req: import('express').Request, res: import('express').Response) => Promise<Boolean>,
	/** Action to be performed when a request is made */
	action: (req: import('express').Request, res: import('express').Response) => Promise<any>
}
