const Debug = require('debug');

const requestContext = require('./request-context');

const { name } = require('../../package.json');

/**
 * Returns a wrapper for `debug` which automatically prefixes logs with the request context ID if one exists
 *
 * @param {String} namespace Namespace of the custom debug instance
 */
module.exports = function (namespace) {
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
};
