const host = process.env.HOST || require('os').networkInterfaces()?.en0?.find(i => i.family === 'IPv4')?.address || 'localhost';

const config = {
	host,
	hot: process.env.HOT === 'true',

	bride: process.env.BRIDE,
	bride_short: process.env.BRIDE_SHORT,
	groom: process.env.GROOM,
	groom_short: process.env.GROOM_SHORT,
	date: new Date(process.env.DATE).valueOf(),

	server: {
		port: process.env.SERVER_PORT,
		external_port: process.env.SERVER_EXTERNALPORT || 443,

		db: {
			host: process.env.SERVER_DB_HOST,
			db: process.env.SERVER_DB_DB,
			username: process.env.SERVER_DB_USERNAME,
			password: process.env.SERVER_DB_PASSWORD
		}
	},
	client: {
		footer: []
	}
};

const footerItems = process.env.CLIENT_FOOTER?.split(',');
for (const item of footerItems) {
	const [ text, url ] = item.split('|');
	config.client.footer.push({ text, url });
}

/** @type {Config} */
module.exports = Object.freeze(config);

/**
 * @typedef FooterItem
 * @property {String} text Display text for the footer item.
 * @property {String} url URL of the footer item.
 *
 * @typedef Config
 * @property {String} host Host of the running server. Defaults to the local IPv4 address, falling back to `'localhost'`.
 * @property {Boolean} hot Whether front-end assets are hosted by the webpack dev server. Defaults to `false`.
 * @property {String} bride Full name of the bride.
 * @property {String} bride_short First name, nickname, or shortened name of the bride.
 * @property {String} groom Full name of the groom.
 * @property {String} groom_short First name, nickname, or shortened name of the groom.
 * @property {Date} date Date of the wedding
 * @property {Object} server Configuration for the running server.
 * @property {Number} server.port Port the server is listening on.
 * @property {Number} server.external_port Port the server is accessible on. Used when running behind a reverse proxy. Defaults to `443`
 * @property {Object} server.db Configuration for the connected database
 * @property {String} server.db.host Host of the database to connect to
 * @property {String} server.db.db Name of the db where the application data is stored
 * @property {String} server.db.username Username of a user in the database with read/write access to the application data
 * @property {String} server.db.password Password to authenticate the database user
 * @property {Object} client Configuration for the front-end client.
 * @property {FooterItem[]} client.footer Data to include in the UI footer.
 */
