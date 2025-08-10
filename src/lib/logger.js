const Debug = require('debug');

const { name } = require('../../package.json');

/**
 * Returns a wrapper for `debug` which automatically prefixes logs with the request context ID if one exists
 *
 * @param {String} namespace Namespace of the custom debug instance
 */
function logger(namespace) {
	return Debug(`${name}:${namespace}`);
}

module.exports = logger;

/**
 * Middleware to wire up a request scoped logger instance, and to log the
 * outcome of the reqest once it resolves
 *
 * @param {WeddingManagerRequest} req Request
 * @param {import('express').Response} res Response
 * @param {import('express').NextFunction} next Next callback
 */
module.exports.middleware = function (req, res, next) {
	// Store a reference of a logger using the request id in its namespace
	req.ctx.log = logger(`req:${req.id}`);
	// Track the start time of the request to calculate its response time
	req._startTime = Date.now();
	// Store a normalised reference of the origin IP for convenient use later in the request chain
	req._ip = req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || req.ip;

	// Override the base end handler
	const end = res.end;
	res.end = function (chunk, encoding) {
		// Calculate the total time the request took to perform
		const responseTime = Date.now() - req._startTime;

		// Restore the original end handler
		res.end = end;
		res.end(chunk, encoding);

		// Log the outcome of the request
		req.ctx.log('%o %s %s %s=%s ip=%s responseTime=%o',
			res.statusCode,
			req.method,
			req.originalUrl || req.url,
			req.ctx.token ? 'token' : 'invitationId',
			req.ctx.token || req.session?.invitationId || 'none',
			req._ip,
			responseTime
		);
	};

	next();
};
