import { format, stripVTControlCharacters } from 'util';
import { hostname } from 'os';
import Debug from 'debug';

import pkg from '../../package.json' with { type: 'json' };
const { name } = pkg;

const host = hostname();

const logBuffer = [];
let dbConnected = false;
/** @type {import('mongodb').Collection<Log>} */
let logDb;

const defaultOut = Debug.log;
Debug.log = function logHandler(msg, ...args) {
	defaultOut(msg, ...args);

	const ns = this.namespace;
	// Cast `created` as a date so the expiry db index policy can be applied
	const created = new Date(this.curr);

	// Debug annoyingly has unconfigurable differentiated message formatting depending on whether stdout is TTY
	if (process.stdout.isTTY) {
		// Remove last argument from TTY output args (ms log diff)
		args.pop();
	} else {
		// Remove the injected ISO string formatted date from the message.
		// JS ISO strings are 24 chars long.
		msg = msg.slice(24);
	}
	// Remove ANSI escape codes, the injected namespace, and surrounding whitespace from the message and apply argument formatting
	const message = stripVTControlCharacters(format(msg.replace(ns, '').trim(), ...args));

	/** @type {Log} */
	const log = {
		created,
		host,
		ns: ns.replace(`${name}:`, ''),
		message
	};

	// If the db isn't connected yet, add it to the buffer
	if (!dbConnected) {
		return logBuffer.push(log);
	}

	// Attempt to insert the log record without await
	logDb.insertOne(log).catch(err => {
		// Deliberately not using debug to prevent recursive errors attempting to insertion error logs
		console.error('Error inserting log record:', String(err));
	});
};

/**
 * Returns a wrapper for `debug` which automatically prefixes logs with the request context ID if one exists
 *
 * @param {String} namespace Namespace of the custom debug instance
 */
export default function logger (namespace) {
	return Debug(`${name}:${namespace}`);
}

/**
 * Middleware to wire up a request scoped logger instance, and to log the
 * outcome of the reqest once it resolves
 *
 * @param {WeddingManagerRequest} req Request
 * @param {import('express').Response} res Response
 * @param {import('express').NextFunction} next Next callback
 */
export function middleware (req, res, next) {
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

/**
 * Imports the log db into the lib, marks the db as connected, and inserts any
 * pending logs into the collection.
 *
 * To be called after the db lib has been connected to prevent referencing the client
 * before it has been initialised.
 */
export async function registerLogDb () {
	logDb = (await import('./db/logs.js')).default;
	dbConnected = true;
	if (logBuffer.length) {
		await logDb.insertMany(logBuffer);
	}
}
