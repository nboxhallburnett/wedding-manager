const MongoDB = require('mongodb');

const config = require('../../conf');
const debug = require('./logger')('db');

// Instance the mongo client
const url = `mongodb://${config.server.db.username}:${config.server.db.password}@${config.server.db.host}/${config.server.db.db}`;
const MongoClient = new MongoDB.MongoClient(url);

module.exports = MongoClient.db();

/**
 * Connect to the database.
 */
module.exports.connect = async () => {
	await MongoClient.connect();
	debug('Database connected');
};

/**
 * Close the database connection.
 */
module.exports.close = async () => {
	await MongoClient.close();
	debug('Database connection closed');
};
