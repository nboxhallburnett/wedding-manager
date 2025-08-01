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
 *
 * @param {WeddingManagerRequest} req Request
 * @param {import('express').Response} res Response
 * @param {import('express').NextFunction} next Next callback
 */
module.exports.middleware = function (req, res, next) {
	req.ctx.log = logger(`req:${req.id}`);
	req._startTime = Date.now();
	req._ip = req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || req.ip;

	const end = res.end;
	res.end = function (chunk, encoding) {
		const responseTime = Date.now() - req._startTime;

		res.end = end;
		res.end(chunk, encoding);

		const url = req.originalUrl || req.url;

		req.ctx.log('%o %s %s invitationId=%s ip=%s responseTime=%o', res.statusCode, req.method, url, req.session?.invitationId || 'none', req._ip, responseTime);
	};

	next();
};
