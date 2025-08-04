const dns = require('dns');
const { BlockList } = require('net');

const config = require('../../conf');
const log = require('../lib/logger')('admin');

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
		localAddressList.addAddress(address)
	}
});

module.exports = {
	isPrivateIp
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
