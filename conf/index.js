const host = process.env.HOST || require('os').networkInterfaces()?.en0?.find(i => i.family === 'IPv4')?.address || 'localhost';

/** @type {Config} */
module.exports = Object.freeze({
	host,
	hot: process.env.HOT === 'true',

	bride: process.env.BRIDE,
	bride_short: process.env.BRIDE_SHORT,
	groom: process.env.GROOM,
	groom_short: process.env.GROOM_SHORT,
	date: new Date(process.env.DATE).valueOf(),

	server: {
		port: process.env.SERVER_PORT,
		external_port: process.env.SERVER_EXTERNALPORT || 443
	}
});

/**
 * @typedef Config
 * @property {String} host Host of the running server. Defaults to the local IPv4 address, falling back to `'localhost'`.
 * @property {Boolean} hot Whether front-end assets are hosted by the webpack dev server. Defaults to `false`.
 * @property {String} bride Full name of the bride.
 * @property {String} bride_short First name, nickname, or shortened name of the bride.
 * @property {String} groom Full name of the groom.
 * @property {String} groom_short First name, nickname, or shortened name of the groom.
 * @property {Object} server Configuration for the running server.
 * @property {Number} server.port Port the server is listening on.
 * @property {Number} server.external_port Port the server is accessible on. Used when running behind a reverse proxy. Defaults to `443`
 */
