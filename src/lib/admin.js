const { BlockList } = require('net');

// Yes, we're using "BlockList" as an allow list
const localAddressList = new BlockList();

// Add list of reserved local/private subnets - https://en.wikipedia.org/wiki/Reserved_IP_addresses
localAddressList.addSubnet('0.0.0.0', 8);
localAddressList.addSubnet('10.0.0.0', 8);
localAddressList.addSubnet('127.0.0.0', 8);
localAddressList.addSubnet('172.16.0.0', 12);
localAddressList.addSubnet('192.168.0.0', 16);

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
