import MongoDB from 'mongodb';

import indexDefinitions from './indexes.js';
import config from '../../../conf/index.js';
import Logger from '../../lib/logger.js';
const log = Logger('db');

// Instance the mongo client
const url = `mongodb://${config.server.db.username}:${config.server.db.password}@${config.server.db.host}/${config.server.db.db}`;

/**
 * Expose the base MongoClient instance for things that require it, such as `connect-mongo`.
 */
export const MongoClient = new MongoDB.MongoClient(url);

export default MongoClient.db();

/**
 * Connect to the database.
 */
export async function connect() {
	await MongoClient.connect();
	log('Database connected');

	// Ensure the database indexes are all up to date before resolving the db connection
	for (const [ collectionName, indexes ] of Object.entries(indexDefinitions)) {
		log('Validating indexes for collection "%s"', collectionName);
		// Ensure the collection exists before creating the indexes
		await MongoClient.db().createCollection(collectionName).catch(err => {
			if (err.codeName === 'NamespaceExists') {
				return;
			}
			throw err;
		});
		const collection = MongoClient.db().collection(collectionName);
		const existingIndexes = await collection.listIndexes().toArray();

		// Drop any existing indexes that we don't have defined
		for (const existingIndex of existingIndexes) {
			if (existingIndex.name !== '_id_' && !indexes.some(([ , indexOpts ]) => indexOpts.name === existingIndex.name)) {
				log('Removing unknown index from collection "%s": "%s"', collectionName, existingIndex.name);
				await collection.dropIndex(existingIndex.name);
			}
		}

		// And add any new indexes that don't already exist
		for (const [ indexSpec, indexOpts ] of indexes) {
			if (!existingIndexes.some(existingIndex => existingIndex.name === indexOpts.name)) {
				log('Adding index to collection "%s": "%s"', collectionName, indexOpts.name);
				await collection.createIndex(indexSpec, indexOpts);
			}
		}
	}

	log('Database indexes up to date');
};

/**
 * Close the database connection.
 */
export async function close () {
	await MongoClient.close();
	log('Database connection closed');
};
