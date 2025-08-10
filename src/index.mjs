import path from 'node:path';
import { STATUS_CODES } from 'node:http';

import MongoStore from 'connect-mongo';
import Session from 'express-session';
import Compression from 'compression';
import CookieParser from 'cookie-parser';
import Express from 'express';
import { nanoid } from 'nanoid';
import { rateLimit } from 'express-rate-limit';

import API from './api/index.js';
import Admin from './lib/admin.js';
import DB from './lib/db/index.js';
import Logger from './lib/logger.js';

import IndexRoute from './routes/index.js';

import pkg from '../package.json' with { type: 'json' };
import config from '../conf/index.js';

const log = Logger('index');

log(`Wedding Manager v${pkg.version} Starting up...`);

const app = Express();
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
app.use(Compression());

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
		log(`Request against unsupported host, responding with error. Request: ${req.method} ${req.protocol}://${req.hostname + req.originalUrl}`);
		return res.status(400).json({
			success: false,
			description: STATUS_CODES[400]
		});
	}
	next();
});

// Serve static assets
app.use(Express.static(path.resolve(import.meta.dirname, '..', 'web', 'public'), {
	maxAge,
	setHeaders: res => {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Expires', new Date(Date.now() + maxAge).toUTCString());
		res.setHeader('X-Content-Type-Options', 'nosniff');
	}
}));

// Add request context store and define an id for the request
app.use(function(req, res, next) {
	req.ctx = {};
	req.id = nanoid();
	next();
});

// Request logging middleware
app.use(Logger.middleware);

// Add cookie parsing
app.use(CookieParser());

// Add session middleware
app.use(Session({
	genid: () => nanoid(),
	key: config.server.session.name,
	name: config.server.session.name,
	proxy: true,
	resave: false,
	saveUninitialized: false,
	secret: config.server.session.secret,
	unset: 'destroy',
	cookie: {
		domain: config.host,
		sameSite: 'strict',
		secure: config.server.external_port === 443
	},
	store: MongoStore.create({
		client: DB.MongoClient,
		stringify: false,
		autoRemove: false, // This is handled by the db index definition
		touchAfter: 24 * 60 * 60 // 24 hours in seconds
	})
}));

// Add admin middleware
app.use(Admin.middleware);

// API-wide middlewares
app.use('/api', ...[
	// Wires up rate limiter for API paths
	rateLimit({
		limit: 10,
		windowMs: 60 * 1000, // One minute
		handler: function (_req, res) {
			res.status(429);
			res.json({ success: false, description: STATUS_CODES[429] });
		},
		keyGenerator: req => {
			// Use the invitation id if there is a valid session
			if (req.session?.invitationId) {
				return req.session.invitationId;
			}
			// Otherwise use the requesting IP
			return req._ip;
		},
		// Skip rate limiting if there is a valid session
		skip: req => Boolean(req.session?.invitationId)
	}),
	// Wires up request body parsing
	Express.urlencoded({ extended: true }),
	Express.json({ limit: '1mb' })
]);

// Wire up the API
await API.init(app);

// Serve the UI
app.get('*splat', IndexRoute.handle);

// Return 404 for any other requests
app.use('*splat', (req, res) => {
	res.status(404);
	// If the request accepts json, send an appropriate response
	if (req.accepts('json')) {
		return res.json({ success: false, description: STATUS_CODES[404] });
	}
	// Otherwise just send the standard 404 text
	return res.send(STATUS_CODES[404]);
});

// Ensure the database has connected and indexes are all up to date before the server starts listening
await dbConnection;

// And finally start listening on the configured port on the unspecified IPv4 address
const server = app.listen(config.server.port, '0.0.0.0', function () {
	log('Server listening on :%d. Accessible at http%s://%s%s', config.server.port, config.server.external_port === 443 ? 's' : '', config.host, config.server.external_port !== 443 ? ':' + config.server.external_port : '');
});

// Listen for SIGTERM events to gracefully close the server
process.on('SIGTERM', async() => {
	log('SIGTERM signal received, shutting down server');
	await new Promise(resolve => {
		server.close(() => {
			log('HTTP server closed');
			resolve();
		});
	});
	// Wait for the http server to stop accepting new connections before closing the db connection
	await DB.close();
});
