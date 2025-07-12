const { AsyncLocalStorage, AsyncResource } = require('async_hooks');

const { nanoid } = require('nanoid');

const storage = new AsyncLocalStorage();

module.exports = {
	middleware,
	get,
	set
};

/**
 * Initialize the store and adds commonly used resources specific to a request.
 *
 * @param {import('express').Request} req Express request
 * @param {import('express').Response} res Express response
 * @param {import('express').NextFunction} next Express next callback
 */
function middleware(req, res, next) {
	const store = req.ctx = {};
	req.id = nanoid();

	// Override req.on to maintain to context.
	const _on = req.on;
	req.on = (evt, fn) => _on.call(req, evt, AsyncResource.bind(fn));

	storage.run(store, async () => {
		// Store the context ID, request, and response objects in the http context.
		store.id = req.id;
		store.req = req;
		store.res = res;
		next();
	});
}

/**
 * Get a value from the store
 *
 * @param {String} key Property name
 * @returns {*} The value
 */
function get(key) {
	const store = storage.getStore();
	return store?.[key];
}

/**
 * Set a value in the store.
 *
 * @param {String} key Property value
 * @param {String} value Value to set
 */
function set(key, value) {
	const store = storage.getStore();
	store[key] = value;
}
