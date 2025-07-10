import path from 'node:path';
import { STATUS_CODES } from 'node:http';

import Debug from 'debug';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';

import pkg from '../package.json' with { type: 'json' };
import config from '../conf/index.js';

const debug = Debug('wedding-planner:index');

debug(`Wedding Planner v${pkg.version} Starting up...`);

const app = express();
const startTime = (new Date()).toISOString();
const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in seconds

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

// Request logging middleware
app.use(function (req, res, next) {
	req._startTime = Date.now();

	const end = res.end;
	res.end = function (chunk, encoding) {
		const responseTime = Date.now() - req._startTime;

		res.end = end;
		res.end(chunk, encoding);

		const url = req.originalUrl || req.url;
		const ip = req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || req.ip;

		debug('%o %s %s ip=%s responseTime=%o', res.statusCode, req.method, url, ip, responseTime);
	};

	next();
});

// Serve static assets
app.use(express.static(path.resolve(import.meta.dirname, '../web', 'public'), {
	maxAge,
	setHeaders: res => {
		res.setHeader('Expires', new Date(Date.now() + maxAge).toUTCString());
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('X-Content-Type-Options', 'nosniff');
	}
}));

// Add cookie parsing
app.use(cookieParser());

// Serve the UI
app.get('*splat', function (_req, res) {
	return res.render('index');
});

// And finally start listening on the configured port
const server = app.listen(config.server.port, function () {
	debug('Listening on port %d', config.server.port);
});

// Listen for SIGTERM events to gracefully close the server
process.on('SIGTERM', () => {
	debug('SIGTERM signal received, closing HTTP server');
	server.close(() => debug('HTTP server closed'));
});
