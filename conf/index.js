const host = process.env.HOST || require('os').networkInterfaces()?.en0?.find(i => i.family === 'IPv4')?.address || 'localhost';

// Construct the configuration object from the supplied environment variables, casting and defaulting as applicable
const config = {
	host,
	hot: process.env.HOT === 'true',

	bride: process.env.BRIDE,
	bride_short: process.env.BRIDE_SHORT,
	groom: process.env.GROOM,
	groom_short: process.env.GROOM_SHORT,
	date: new Date(process.env.DATE).valueOf(),

	oauth: {
		client_id: process.env.OAUTH_CLIENTID
	},

	server: {
		port: Number(process.env.SERVER_PORT),
		external_port: Number(process.env.SERVER_EXTERNALPORT) || 443,

		db: {
			host: process.env.SERVER_DB_HOST,
			db: process.env.SERVER_DB_DB,
			username: process.env.SERVER_DB_USERNAME,
			password: process.env.SERVER_DB_PASSWORD
		},

		session: {
			name: process.env.SERVER_SESSION_NAME || 'invitation',
			secret: process.env.SERVER_SESSION_SECRET
		}
	},
	client: {
		footer: [],
		palette: [],
		theme: {
			primary: process.env.CLIENT_THEME_PRIMARY,
			secondary: process.env.CLIENT_THEME_SECONDARY
		}
	}
};

const errors = [];
const required = [
	'BRIDE',
	'BRIDE_SHORT',
	'GROOM',
	'GROOM_SHORT',
	'DATE',
	'SERVER_PORT',
	'SERVER_DB_HOST',
	'SERVER_DB_DB',
	'SERVER_DB_USERNAME',
	'SERVER_DB_PASSWORD',
	'SERVER_SESSION_NAME',
	'SERVER_SESSION_SECRET'
];

// Loop over the defined required configuration variables and add them to the error set if they don't exist
for (const prop of required) {
	if (!process.env[prop]) {
		errors.push(prop);
	}
}

// An individual footer item is defined in markdown link syntax, `[text](url)`.
// Note that both sections are optional, but items without either will be ignored
const reFooterItem = /^(?:\[([^|]*)])?(?:\(([^|]*)\))?$/;
for (const item of process.env.CLIENT_FOOTER?.split('|') || []) {
	const [ , text, url ] = reFooterItem.exec(item);
	if (text || url) {
		config.client.footer.push({ text, url });
	} else {
		console.warn('Ignoring configured footer item:', item, '- Does not match required format');
	}
}

for (const item of process.env.CLIENT_PALETTE?.split('|') || []) {
	const [ name, value ] = item.split(',');
	if (name && value) {
		config.client.palette.push({ name, value });
	} else {
		console.warn('Invalid palette value', item);
	}
}

// Process any defined style overrides
if (process.env.CLIENT_THEME) {
	// Split the provided scss vars on ,
	const vars = process.env.CLIENT_THEME.split(',');
	for (const scssVar of vars) {
		// The associated value will be defined as a concatenated upper case string of the var name
		const key = `CLIENT_THEME_${scssVar.toUpperCase().replaceAll('-', '')}`;
		const val = process.env[key];
		if (!val) {
			console.warn(`Ignoring scss var "$${scssVar}", no associated value defined in env (expecting ${key})`);
		} else {
			config.client.theme[scssVar] = val;
		}
	}
}

// If there are any errors, log them and exit
if (errors.length) {
	console.error('Error: Missing required configuration item(s):', required);
	process.exit(1);
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
 * @property {String[]} gallery_text Text to display on the gallery page, split by `|`
 * @property {Object} oauth Configuration for the OAuth 2.0 client to use for external admin access.
 * @property {String} oauth.client_id `client_id` for the application on the OAuth 2.0 service.
 * @property {Object} server Configuration for the running server.
 * @property {Number} server.port Port the server is listening on.
 * @property {Number} server.external_port Port the server is accessible on. Used when running behind a reverse proxy. Defaults to `443`
 * @property {Object} server.db Configuration for the connected database.
 * @property {String} server.db.host Host of the database to connect to.
 * @property {String} server.db.db Name of the db where the application data is stored.
 * @property {String} server.db.username Username of a user in the database with read/write access to the application data.
 * @property {String} server.db.password Password to authenticate the database user.
 * @property {Object} server.session Configuration for the session store and cookie.
 * @property {String} server.session.name Name of the session cookie.
 * @property {String} server.session.secret Secret used to sign the session.
 * @property {Object} client Configuration for the front-end client.
 * @property {FooterItem[]} client.footer Data to include in the UI footer.
 * @property {{ primary: String, [key: String]: String }} client.theme Values to use for default theme overrides
 */
