/**
 * Access is determined by whether there is a valid admin session
 *
 * @type {API['auth']}
 */
export async function adminAuth(req) {
	return Boolean(req.ctx.admin);
}

/**
 * Access is allowed if the request is made by either the subject of the request or via an admin session
 *
 * @type {API['auth']}
 */
export async function selfAuth(req) {
	return Boolean(req.params.invitationId === req.session.invitationId || req.ctx.admin);
}

/**
 * Access is determined by whether there is a valid invitation session
 *
 * @type {API['auth']}
 */
export async function sessionAuth(req) {
	return Boolean(req.session.invitationId);
}
