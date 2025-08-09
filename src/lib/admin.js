const dns = require('dns');
const { BlockList } = require('net');

const config = require('../../conf');
const log = require('../lib/logger')('admin');
const tokenDb = require('./db/tokens');

// Yes, we're using "BlockList" as an allow list
const localAddressList = new BlockList();

// Add list of reserved local/private subnets - https://en.wikipedia.org/wiki/Reserved_IP_addresses
localAddressList.addSubnet('0.0.0.0', 8);
localAddressList.addSubnet('10.0.0.0', 8);
localAddressList.addSubnet('127.0.0.0', 8);
localAddressList.addSubnet('172.16.0.0', 12);
localAddressList.addSubnet('192.168.0.0', 16);

// Attempt to fetch the host machine's IP address from an A record of the host
dns.resolve4(config.host, (err, addresses) => {
	if (err) {
		log('Error resolving IPv4 record: %s', String(err));
		return;
	}
	log('Fetched host machine IPv4 address(es): %o', addresses);
	for (const address of addresses) {
		localAddressList.addAddress(address);
	}
});

module.exports = {
	isPrivateIp,
	middleware
};

/**
 * Returns whether a specified IP address is within the local network or on a private subnet
 *
 * @param {String} ip IP address to check
 * @returns {Boolean}
 */
function isPrivateIp(ip) {
	return localAddressList.check(ip);
}

/**
 * Handle setting an appropriate value for elevated access in the request context.
 *
 * @param {WeddingManagerRequest} req Request
 * @param {import('express').Response} res Express response
 * @param {import('express').NextFunction} next Express next callback
 */
async function middleware(req, _res, next) {
	// If there is an admin session, mark the request as having admin access
	if (req.session.admin) {
		req.ctx.admin = true;
		return next();
	}
	// If an auth token header was passed, verify it is known
	if (req.headers['x-auth-token']) {
		const tokenDoc = await tokenDb.findOne({ id: req.headers['x-auth-token'] });
		// If it doesn't exist, log the request and continue with the request flow
		if (!tokenDoc) {
			req.ctx.log('Invalid auth token provided: %s', req.headers['x-auth-token']);
			return next();
		}
		// Valid auth tokens grant admin access
		req.ctx.admin = true;
		// Store a reference to the token name in the request context for logging
		req.ctx.token = tokenDoc.name;
		return next();
	}
	// If neither admin flows were followed, continue with the request flow
	next();
}
