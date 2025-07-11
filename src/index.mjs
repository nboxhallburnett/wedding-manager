import path from 'node:path';
import { STATUS_CODES } from 'node:http';

import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import { rateLimit } from 'express-rate-limit';

import RequestContext from './lib/request-context.js';
import Logger from './lib/logger.js';
import API from './api/index.js';
import DB from './lib/db.js';

import pkg from '../package.json' with { type: 'json' };
import config from '../conf/index.js';

const debug = Logger('index');

debug(`Wedding Planner v${pkg.version} Starting up...`);

const app = express();
const startTime = (new Date()).toISOString();
const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in seconds

// Trigger the database connection before wiring up the server
const dbConnection = DB.connect();

// Disable x-powered-by header to reduce fingerprinting
app.disable('x-powered-by');

// Tell express we're running behind a reverse proxy so it adjusts exposed properties as necessary
app.set('trust proxy', true);

// Tell express we're using ejs for views and set the views directory within /src/
app.set('views', path.resolve(import.meta.dirname, './views/'));
app.set('view engine', 'ejs');

// Make the config globally available in views
app.locals = {
	config
};

// Add gzip compression for responses
app.use(compression());

// Basic status endpoint to be used as a healthcheck
app.get('/status', function (_req, res) {
	res.json({
		version: pkg.version,
		start_time: startTime,
		uptime: process.uptime()
	});
});

// If one is configured, error if a request is made from an invalid or unknown host
app.use(function (req, res, next) {
	if (req.hostname !== config.host) {
		debug(`Request against unsupported host, responding with error. Request: ${req.method} ${req.protocol}://${req.hostname + req.originalUrl}`);
		return res.status(400).json({
			success: false,
			description: STATUS_CODES[400]
		});
	}
	next();
});

// Wire up request context middleware
app.use(RequestContext.middleware);

// Request logging middleware
app.use(function (req, res, next) {
	req._startTime = Date.now();

	const end = res.end;
	res.end = function (chunk, encoding) {
		const responseTime = Date.now() - req._startTime;

		res.end = end;
		res.end(chunk, encoding);

		const url = req.originalUrl || req.url;

		debug('%o %s %s ip=%s responseTime=%o', res.statusCode, req.method, url, _getIp(req), responseTime);
	};

	next();
});

// Serve static assets
app.use(express.static(path.resolve(import.meta.dirname, '..', 'web', 'public'), {
	maxAge,
	setHeaders: res => {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Expires', new Date(Date.now() + maxAge).toUTCString());
		res.setHeader('X-Content-Type-Options', 'nosniff');
	}
}));

// Add cookie parsing
app.use(cookieParser());

// API-wide middlewares
app.use('/api', ...[
	// Wires up rate limiter for API paths. Rate limit API requests to 10 per minute
	rateLimit({
		windowMs: 60000,
		limit: 10,
		// skipSuccessfulRequests: true,
		skip: (_req, _res) => {
			// TODO: skip if RSVP identifier in session
			return false;
		},
		handler: function (req, res) {
			res.status(429);
			res.json({ success: false, description: STATUS_CODES[429] });
		},
		keyGenerator: req => {
			// TODO: use RSVP identifier once wired up
			return _getIp(req);
		}
	}),
	// Wires up request body parsing
	express.urlencoded({ extended: true }),
	express.json({ limit: '1mb' })
]);

// Wire up the API
await API.init(app);

// Serve the UI
app.get('*splat', function (_req, res) {
	return res.render('index');
});

// Ensure the database has connected before the server starts listening
await dbConnection;

// And finally start listening on the configured port
const server = app.listen(config.server.port, function () {
	debug('Listening on port %d', config.server.port);
});

// Listen for SIGTERM events to gracefully close the server
process.on('SIGTERM', async() => {
	debug('SIGTERM signal received, shutting down server');
	await new Promise(resolve => {
		server.close(() => {
			debug('HTTP server closed');
			resolve();
		});
	});
	// Wait for the http server to stop accepting new connections before closing the db connection
	await DB.close();
});

/**
 * Returns the IP address the request originated from
 *
 * @param {import('express').Request} req Express request
 * @returns {String} IP address of the requester
 */
function _getIp(req) {
	return req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || req.ip;
}
