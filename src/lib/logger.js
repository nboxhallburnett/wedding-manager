const Debug = require('debug');

const requestContext = require('./request-context');

const { name } = require('../../package.json');

const requestLog = logger('req');

/**
 * Returns a wrapper for `debug` which automatically prefixes logs with the request context ID if one exists
 *
 * @param {String} namespace Namespace of the custom debug instance
 */
function logger(namespace) {
	const logger = Debug(`${name}:${namespace}`);

	/**
	 * @param {String} msg Base log message
	 * @param {...any} args Arguments to pass to the message formatter
	 */
	return function (msg, ...args) {
		const id = requestContext.get('id');
		if (id) {
			return logger(`[%s] ${msg}`, id, ...args);
		}
		logger(msg, ...args);
	};
}

module.exports = logger;

module.exports.middleware = function (req, res, next) {
	req._startTime = Date.now();
	req._ip = req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || req.ip;

	const end = res.end;
	res.end = function (chunk, encoding) {
		const responseTime = Date.now() - req._startTime;

		res.end = end;
		res.end(chunk, encoding);

		const url = req.originalUrl || req.url;

		requestLog('%o %s %s ip=%s responseTime=%o', res.statusCode, req.method, url, req._ip, responseTime);
	};

	next();
};
